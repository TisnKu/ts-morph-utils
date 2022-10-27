import { Project } from "ts-morph";
import { moveDeclaration } from "../src/common/ast";
import { cleanGenerated } from "./utils";

cleanGenerated();

const project = new Project();
project.createSourceFile(
  "generated/a.ts",
  `
export const a = 100;
export function x() {

}

export enum Y {
 A,B,C
}

export class Z {
  public a = 100;
}
`
);
project.createSourceFile(
  "generated/b.ts",
  `
import { a } from "./a";
export const b = a+100;
`
);
project.createSourceFile(
  "generated/c.ts",
  `
export const c = 200;
`
);

const fileA = project.getSourceFileOrThrow("a.ts");
const fileB = project.getSourceFileOrThrow("b.ts");
const fileC = project.getSourceFileOrThrow("c.ts");
const a = fileA.getVariableDeclarationOrThrow("a");
const x = fileA.getFunctionOrThrow("x");
const y = fileA.getEnum("Y");
const z = fileA.getClass("Z");

console.log(x.getText());
console.log(x.getKindName());

console.log(y.getText());
console.log(y.getKindName());

console.log(z.getText());
console.log(z.getKindName());

console.log(a.isExported()); // true
console.log(a.getFullText());
console.log(a.getText());
console.log(a.getParent().getText());
const pp = a.getParent().getParent();
console.log(pp.getKindName(), pp.getText());

moveDeclaration(a, fileC);
moveDeclaration(x, fileC);
moveDeclaration(y, fileC);
moveDeclaration(z, fileC);

project.saveSync();
