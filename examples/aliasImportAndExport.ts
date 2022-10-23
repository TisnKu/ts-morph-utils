import { ImportSpecifier, Project, SyntaxKind } from "ts-morph";
import { cleanGenerated } from "./utils";

cleanGenerated();

const project = new Project();
project.createSourceFile(
  "generated/a.ts",
  `
import {ClassA as AliasA} from "./b";
`
);
project.createSourceFile(
  "generated/b.ts",
  `
export class ClassA {}
`
);
const fileA = project.getSourceFileOrThrow("a.ts");
const importSpecifier: ImportSpecifier = fileA.getFirstDescendant(
  (node) => node.getKind() === SyntaxKind.ImportSpecifier
) as ImportSpecifier;
console.log(
  importSpecifier.getName(),
  importSpecifier.getAliasNode()?.getText()
);

fileA.addImportDeclaration({
  namedImports: [{ name: "ClassA", alias: "ClassA" }],
  moduleSpecifier: "./b",
});

project.saveSync();
