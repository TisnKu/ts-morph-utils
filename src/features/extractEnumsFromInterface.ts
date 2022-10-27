import { Project } from "ts-morph";
import { getOrCreateFile, moveDeclaration } from "../common/ast";

export default function (project: Project) {
  project
    .getSourceFiles()
    .filter((sourceFile) => sourceFile.getFilePath().endsWith(".interface.ts"))
    .forEach((sourceFile) => {
      const enumDeclarations = sourceFile.getEnums();
      const classDeclarations = sourceFile.getClasses();
      [...enumDeclarations, ...classDeclarations].forEach(
        (enumOrClassDeclaration) => {
          moveDeclaration(
            enumOrClassDeclaration,
            getOrCreateFile(
              project,
              sourceFile.getFilePath().replace(".interface.ts", ".enum.ts")
            )
          );
        }
      );
    });

  project
    .getSourceFiles()
    .filter((sourceFile) => !sourceFile.getFilePath().includes("enum"))
    .forEach((sourceFile) => {
      // find all enums in the interface file
      const enumDeclarations = sourceFile.getEnums();
      [...enumDeclarations].forEach((enumOrClassDeclaration) => {
        moveDeclaration(
          enumOrClassDeclaration,
          getOrCreateFile(
            project,
            sourceFile.getFilePath().replace(".interface.ts", ".enum.ts")
          )
        );
      });
    });

  project.saveSync();
}
