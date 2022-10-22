import {
  ExpressionWithTypeArguments,
  ImportSpecifier,
  Project,
  SyntaxKind,
} from "ts-morph";
import { findDeclaration } from "../src/common/ast";
import { cleanGenerated } from "./utils";

cleanGenerated();

const project = new Project();
project.createSourceFile(
  "generated/b.interface.ts",
  `
export interface IClassB {
}
`
);
project.createSourceFile(
  "generated/b.ts",
  `
import {IClassB} from "./b.interface";
export class ClassB implements IClassB {
  public errorCode: string;
}
`
);
const fileB = project.getSourceFileOrThrow("b.ts");
fileB
  .getClassOrThrow("ClassB")
  .getImplements()
  .forEach((i: ExpressionWithTypeArguments) => {
    const namedImport = fileB.getFirstDescendant(
      (node) =>
        node.getKind() === SyntaxKind.ImportSpecifier &&
        node.getText() === i.getText()
    );
    console.log(namedImport);

    const declaration = findDeclaration(namedImport as ImportSpecifier);
    console.log(
      declaration?.getText(),
      declaration?.getSourceFile().getFilePath()
    );
  });

project.saveSync();
