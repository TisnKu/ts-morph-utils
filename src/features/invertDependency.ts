import {
  ClassDeclaration,
  ImportDeclaration,
  ImportSpecifier,
  InterfaceDeclaration,
  Node,
  SyntaxKind,
} from "ts-morph";
import { getRelativePath } from "../common/file";
import { createProject } from "../common/project";

export default function (tsconfigPath?: string, projectPath?: string) {
  const project = createProject({
    tsConfigFilePath: tsconfigPath,
    projectPath,
  });

  const newInterfaceDeclarations = new Map();
  project
    .getSourceFiles()
    .filter((sourceFile) => sourceFile.getFilePath().endsWith(".interface.ts"))
    .forEach((sourceFile) => {
      sourceFile.getImportDeclarations().forEach((importDeclaration) => {
        const classImports = filterClassImports(importDeclaration);

        for (const [namedImport, classDeclaration] of classImports) {
          const classFilePath = classDeclaration.getSourceFile().getFilePath();
          const className = classDeclaration.getName();
          const classKey = `${classFilePath}#${className}`;

          const interfaceDeclaration = getOrGenerateInterface(
            classKey,
            classDeclaration
          );
          replaceOldReferences(namedImport, interfaceDeclaration);

          console.log(
            "Optimized",
            sourceFile.getFilePath(),
            classDeclaration.getSourceFile().getFilePath()
          );
        }

        function getOrGenerateInterface(
          classKey: string,
          declaration: ClassDeclaration
        ) {
          if (!newInterfaceDeclarations.has(classKey)) {
            const interfaceDeclaration = generateInterface(declaration);
            newInterfaceDeclarations.set(classKey, interfaceDeclaration);
            return interfaceDeclaration;
          } else {
            const interfaceDeclaration = newInterfaceDeclarations.get(classKey);
            sourceFile.addImportDeclaration({
              moduleSpecifier: getRelativePath(
                sourceFile.getFilePath(),
                interfaceDeclaration.getSourceFile().getFilePath()
              ),
              namedImports: [interfaceDeclaration.getName()],
            });
            return interfaceDeclaration;
          }
        }
      });

      function replaceOldReferences(
        namedImport: ImportSpecifier,
        interfaceDeclaration: InterfaceDeclaration
      ) {
        namedImport
          .getNameNode()
          .findReferencesAsNodes()
          .forEach((reference) => {
            if (
              reference.getSourceFile() === sourceFile &&
              !Node.isImportSpecifier(reference.getParentOrThrow())
            ) {
              reference.replaceWithText(interfaceDeclaration.getName());
            }
          });
        const importDeclaration = namedImport.getImportDeclaration();
        namedImport.remove();
        if (importDeclaration.getNamedImports().length === 0) {
          importDeclaration.remove();
        }
      }

      function filterClassImports(importDeclaration: ImportDeclaration) {
        return importDeclaration
          .getNamedImports()
          .reduce((acc, namedImport) => {
            const declaration = importDeclaration
              .getModuleSpecifierSourceFile()
              ?.getExportedDeclarations()
              .get(namedImport.getName())[0];
            if (declaration?.getKind() === SyntaxKind.ClassDeclaration) {
              acc.push([namedImport, declaration]);
            }
            return acc;
          }, []) as [ImportSpecifier, ClassDeclaration][];
      }

      function generateInterface(declaration: ClassDeclaration) {
        const interfaceName = `I${declaration.getName()}`;
        const interfaceDeclaration = sourceFile.addInterface(
          declaration.extractInterface(interfaceName)
        );
        sourceFile.fixMissingImports();
        interfaceDeclaration.setIsExported(true);

        declaration.addImplements(interfaceName);
        declaration.getSourceFile().addImportDeclaration({
          moduleSpecifier: getRelativePath(
            declaration.getSourceFile().getFilePath(),
            sourceFile.getFilePath()
          ),
          namedImports: [interfaceName],
        });
        return interfaceDeclaration;
      }
    });

  project.saveSync();
}
