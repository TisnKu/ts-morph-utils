import { ClassDeclaration, Project } from "ts-morph";
import { cleanGenerated } from "./utils";

cleanGenerated();

const project = new Project();
project.createSourceFile(
  "generated/a.ts",
  `
export class A {
 constructor(public x: number, public y: string) {}
}
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
const fileB = project.getSourceFileOrThrow("b.ts");
fileA.getClasses().forEach((klass: ClassDeclaration) => {
  const interfaceDeclaration = fileA.addInterface(
    klass.extractInterface(`I${klass.getName()}`)
  );
  interfaceDeclaration.setIsExported(true);
  klass.addImplements(`I${klass.getName()}`);
  fileB.addClass(klass.getStructure());
  fileB.addImportDeclaration({
    moduleSpecifier: "./a",
    namedImports: [`I${klass.getName()}`],
  });
  klass.remove();
  fileA.formatText();
});

project.saveSync();
