import { Project, SyntaxKind } from "ts-morph";
import { cleanGenerated } from "./utils";

cleanGenerated();

const project = new Project();
project.createSourceFile(
  "generated/a.ts",
  `import { b } from "./b";
import IB = teams.calling.IB;
`
);
project.createSourceFile(
  "generated/b.ts",
  `
namespace teams.calling {
  export interface IB {
  }
}
`
);

const a = project.getSourceFileOrThrow("generated/a.ts");

a.getImportDeclarations().forEach((imp) => {
  console.log(imp.getModuleSpecifierValue());
  console.log(imp.getNamedImports().map((i) => i.getName()));
  console.log(imp.getNamedImports().map((i) => i.getAliasNode()?.getText()));
  console.log(imp);
});

console.log(
  a.getStatements().map((s) => {
    console.log(s.getKindName());
    return s.getText();
  })
);

a.addStatements("import IC = teams.calling.IC;");

const importDeclarations = a.getChildrenOfKind(SyntaxKind.ImportDeclaration);
a.insertStatements(importDeclarations.length, "import ID = teams.calling.ID;");
console.log(a.getText());

project.saveSync();
