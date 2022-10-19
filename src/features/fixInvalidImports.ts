import _ from "lodash";
import { ImportDeclaration, SourceFile } from "ts-morph";
import { createProject } from "../common/project";

export default function (tsconfigPath?: string, projectPath?: string) {
  const project = createProject({
    tsConfigFilePath: tsconfigPath,
    projectPath,
  });
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
              declaration.getSourceFile().fixMissingImports();
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

  //const newproject = createProject({
  //  tsConfigFilePath: tsconfigPath,
  //  projectPath,
  //});
  //optimizedFiles.forEach((filePath) => {
  //  newproject.getSourceFile(filePath)?.fixMissingImports();
  //});
  //newproject.save();

  function hasNamedExport(
    sourceFile: SourceFile,
    namedExport: string
  ): boolean {
    return [...sourceFile.getExportedDeclarations().keys()].some(
      (name: string) => name === namedExport
    );
  }
}
