import { Project } from "ts-morph";
import { getOrCreateFile, moveDeclaration } from "../common/ast";

export default function (project: Project) {
  project
    .getSourceFiles()
    .filter((sourceFile) => sourceFile.getFilePath().endsWith(".interface.ts"))
    .forEach((sourceFile) => {
      // find all enums in the interface file
      const enumDeclarations = sourceFile.getEnums();
      enumDeclarations.forEach((enumDeclaration) => {
        moveDeclaration(
          enumDeclaration,
          getOrCreateFile(
            project,
            sourceFile.getFilePath().replace(".interface.ts", ".enum.ts")
          )
        );
      });
    });
  project.saveSync();
}
