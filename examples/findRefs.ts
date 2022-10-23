import { ClassDeclaration, Project, SyntaxKind } from "ts-morph";
import { cleanGenerated } from "./utils";

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
const classDeclaration: ClassDeclaration = fileA.getFirstDescendant(
  (node) => node.getKind() === SyntaxKind.ClassDeclaration
) as ClassDeclaration;
classDeclaration.findReferencesAsNodes().forEach((ref) => {
  console.log(
    ref.getSourceFile().getFilePath(),
    ref.getKindName(),
    ref.getParentWhileKind(SyntaxKind.ImportDeclaration)?.getText(),
    ref.getParent().getText(),
    ref.getParent().getParent().getText(),
    ref.getParent().getParent().getParent().getText(),
    ref.getParent().getParent().getParent().getParent().getText()
  );
});

project.saveSync();
