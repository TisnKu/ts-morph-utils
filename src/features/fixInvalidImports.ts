import _ from "lodash";
import { ImportDeclaration, Project, SourceFile } from "ts-morph";

export default function (project: Project) {
  const queue = [];
  project.getSourceFiles().forEach((sourceFile) => {
    return sourceFile
      .getImportDeclarations()
      .forEach((declaration: ImportDeclaration) => {
        declaration.getNamedImports().forEach((namedImport) => {
          if (!declaration.getModuleSpecifierValue().startsWith(".")) {
            return;
          }
          const sourceFileImported: SourceFile =
            declaration.getModuleSpecifierSourceFile();
          if (
            sourceFileImported === undefined ||
            !hasNamedExport(sourceFileImported, namedImport.getName())
          ) {
            queue.push(() => {
              namedImport.remove();
              if (declaration.getNamedImports().length === 0) {
                declaration.remove();
              }
              //declaration.getSourceFile().fixMissingImports();
              return declaration.getSourceFile().getFilePath();
            });
          }
        });
      });
  });

  console.log("Files optimized: \n");
  const optimizedFiles = _.uniq(queue.map((fn) => fn()));
  project.saveSync();

  console.log(optimizedFiles.join("\n"));

  (function fixMissingImports() {
    optimizedFiles.forEach((filePath) => {
      project.getSourceFile(filePath)?.fixMissingImports();
      project.saveSync();
    });
  })();

  (function cleanup() {
    optimizedFiles.forEach((filePath) => {
      const sourceFile = project.getSourceFile(filePath);
      sourceFile?.getImportDeclarations().forEach((declaration) => {
        if (declaration.getModuleSpecifierValue() === "assert") {
          declaration.remove();
        }
      });
    });
    project.saveSync();
  })();

  function hasNamedExport(
    sourceFile: SourceFile,
    namedExport: string
  ): boolean {
    return [...sourceFile.getExportedDeclarations().keys()].some(
      (name: string) => name === namedExport
    );
  }
}
