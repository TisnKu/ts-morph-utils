import { Project, ImportDeclaration, SourceFile } from "ts-morph";
import _ from "lodash";

(function () {
  const project = new Project();
  project.addSourceFilesAtPaths("./src/test/invalidImports/**/*.ts");

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
              if (declaration.getNamedImports().length === 1) {
                declaration.remove();
              } else {
                namedImport.remove();
              }
            });
          }
        });
      });
  });

  queue.forEach((fn) => fn());

  project.save();

  function hasNamedExport(
    sourceFile: SourceFile,
    namedExport: string
  ): boolean {
    return sourceFile
      .getExportDeclarations()
      .some((declaration) =>
        declaration.getNamedExports().some((ne) => ne.getName() === namedExport)
      );
  }
})();
