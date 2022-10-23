import { Project } from "ts-morph";
import { getOrCreateFile } from "../common/ast";
import fixInvalidImports from "./fixInvalidImports";

export default function (project: Project) {
  project
    .getSourceFiles()
    .filter((sourceFile) => sourceFile.getFilePath().endsWith(".interface.ts"))
    .forEach((sourceFile) => {
      // find all enums in the interface file
      const enumDeclarations = sourceFile.getEnums();

      // and create an enum file for all of them
      const enumFilePath = sourceFile
        .getFilePath()
        .replace(".interface", ".enum");
      const enumFile = getOrCreateFile(project, enumFilePath);
      enumFile.addEnums(
        enumDeclarations.map((enumDeclaration) =>
          enumDeclaration.getStructure()
        )
      );

      // remove the enums from the interface file
      enumDeclarations.forEach((enumDeclaration) => enumDeclaration.remove());
      //sourceFile.addImportDeclaration({
      //  moduleSpecifier: getRelativePath(
      //    sourceFile.getFilePath(),
      //    enumFile.getFilePath()
      //  ),
      //  namedImports: enumDeclarations.map((enumDeclaration) =>
      //    enumDeclaration.getName()
      //  ),
      //});
    });
  project.saveSync();

  fixInvalidImports(project);
}
