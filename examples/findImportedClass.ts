import { Project, SyntaxKind } from "ts-morph";
import { cleanGenerated } from "./utils";

cleanGenerated();

const project = new Project();
project.createSourceFile(
  "generated/a.ts",
  `
import { ClassB } from "./b";
`
);
project.createSourceFile(
  "generated/b.ts",
  `
export class ClassB {
  public errorCode: string;
}
`
);
const fileA = project.getSourceFileOrThrow("a.ts");
fileA.getImportDeclarations().forEach((importDeclaration) => {
  const classImports = importDeclaration
    .getNamedImports()
    .reduce((acc, namedImport) => {
      const declaration = importDeclaration
        .getModuleSpecifierSourceFile()
        .getExportedDeclarations()
        .get(namedImport.getName())[0];
      if (declaration.getKind() === SyntaxKind.ClassDeclaration) {
        acc.push([namedImport, declaration]);
      }
      return acc;
    }, []);
});

project.saveSync();
