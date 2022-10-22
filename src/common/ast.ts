import {
  ExportedDeclarations,
  Expression,
  ImportSpecifier,
  SourceFile,
  SyntaxKind,
} from "ts-morph";
import { getRelativePath } from "./file";

export function findDeclaration(
  namedImport: ImportSpecifier
): ExportedDeclarations {
  return namedImport
    ?.getImportDeclaration()
    .getModuleSpecifierSourceFile()
    ?.getExportedDeclarations()
    .get(namedImport.getName())?.[0];
}

export function findImportedDeclaration(
  name: string,
  sourceFile: SourceFile
): ExportedDeclarations {
  const namedImport = sourceFile.getFirstDescendant(
    (node) =>
      node.getKind() === SyntaxKind.ImportSpecifier && node.getText() === name
  );

  return findDeclaration(namedImport as ImportSpecifier);
}

export function getOrCreateInterfaceFile(sourceFile: SourceFile): SourceFile {
  const interfaceFileName = sourceFile
    .getFilePath()
    .replace(".ts", ".interface.ts");
  return (
    sourceFile.getProject().getSourceFile(interfaceFileName) ||
    sourceFile.getProject().createSourceFile(interfaceFileName, "")
  );
}

export function moveDeclaration(
  declaration: Exclude<ExportedDeclarations, Expression | SourceFile>,
  to: SourceFile
): void {
  const name = declaration.getName();
  const from = declaration.getSourceFile();
  const refs = declaration.findReferencesAsNodes();
  to.addStatements(declaration.getText());

  declaration.remove();
  refs.forEach((ref) => {
    const sourceFile = ref.getSourceFile();
    const namedImport = ref.getFirstAncestorByKind(SyntaxKind.ImportSpecifier);
    if (namedImport) {
      if (namedImport.getImportDeclaration().getNamedImports().length === 1) {
        namedImport.getImportDeclaration().remove();
      } else {
        namedImport.remove();
      }
    }
    if (from == sourceFile || (namedImport && sourceFile !== to)) {
      sourceFile.addImportDeclaration({
        namedImports: [name],
        moduleSpecifier: getRelativePath(
          sourceFile.getFilePath(),
          to.getFilePath()
        ),
      });
    }
  });
  to.fixMissingImports();
  if (declaration.getSourceFile().getStatements().length === 0) {
    declaration.getSourceFile().delete();
  }
}
