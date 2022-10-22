import { ClassDeclaration, Project, SyntaxKind } from "ts-morph";
import { moveDeclaration } from "../src/common/ast";
import { cleanGenerated, printGeneratedFiles } from "./utils";

cleanGenerated();

const project = new Project();
project.createSourceFile(
  "generated/a.ts",
  `
export class ClassA {
}

export const a = new ClassA();
`
);
project.createSourceFile(
  "generated/b.ts",
  `
import {ClassA} from "./a";
export const b = new ClassA();
`
);

project.createSourceFile(
  "generated/c.ts",
  `
import {ClassA} from "./a";
export const c = new ClassA();
`
);
const fileA = project.getSourceFileOrThrow("a.ts");
const fileC = project.getSourceFileOrThrow("c.ts");
const classDeclaration: ClassDeclaration = fileA.getFirstDescendant(
  (node) => node.getKind() === SyntaxKind.ClassDeclaration
) as ClassDeclaration;
moveDeclaration(classDeclaration, fileC);

project.saveSync();

printGeneratedFiles();
