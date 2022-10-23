import { Project } from "ts-morph";
import { cleanGenerated } from "./utils";

cleanGenerated();

const project = new Project();
project.createSourceFile(
  "generated/a.ts",
  `
export {ClassA} from './b';
`
);
project.createSourceFile(
  "generated/b.ts",
  `
export class ClassA {}
`
);

const fileA = project.getSourceFileOrThrow("a.ts");
fileA.getExportDeclarations().forEach((exportDeclaration) => {
  console.log(
    exportDeclaration.getText(),
    exportDeclaration.getKindName(),
    exportDeclaration.getModuleSpecifierValue(),
    exportDeclaration
      .getNamedExports()
      .map((namedExport) => namedExport.getText())
  );
});

console.log(fileA.getExportedDeclarations());

const fileB = project.getSourceFileOrThrow("b.ts");
fileB.getReferencedSourceFiles().forEach((referencedSourceFile) => {
  console.log("referenced", referencedSourceFile.getFilePath());
});
fileB.getReferencingSourceFiles().forEach((referencingSourceFile) => {
  console.log("referencing", referencingSourceFile.getFilePath());
});

console.log(fileB.getExportDeclarations());
console.log(fileB.getExportedDeclarations());

project.saveSync();
