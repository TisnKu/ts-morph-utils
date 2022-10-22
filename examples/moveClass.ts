import { ClassDeclaration, Project } from "ts-morph";

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
  fileA.addInterface(klass.extractInterface(`I${klass.getName()}`));
  fileB.addClass(klass.getStructure());
  klass.remove();
});

project.saveSync();
