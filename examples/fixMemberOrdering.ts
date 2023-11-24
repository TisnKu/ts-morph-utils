import {
  ClassDeclaration,
  MethodDeclaration,
  Project,
  SyntaxKind,
} from "ts-morph";
import { cleanGenerated } from "./utils";

cleanGenerated();

const project = new Project();
project.createSourceFile(
  "generated/a.ts",
  `
export class A {
  constructor(public x: number, public y: string) {}

  // comment of a
  private a() {
    return 1;
  }

  /**
  * comment of d
  */
  protected d() {
    return 4;
  }

  /**
  * comment of c
  */
  public c() {
    return 3;
  }

  // comment of b
  public b() {
    return 2;
  }
}
`
);
project.addSourceFileAtPath("callingSupportService.ts");

const getModifier = (method: MethodDeclaration) =>
  method
    .getModifiers()
    .find((m) =>
      [
        SyntaxKind.PublicKeyword,
        SyntaxKind.ProtectedKeyword,
        SyntaxKind.PrivateKeyword,
      ].includes(m.getKind())
    )
    .getKind();
const fileA = project.getSourceFileOrThrow("callingSupportService.ts");
const fileB = project.getSourceFileOrThrow("a.ts");
fileA.getClasses().forEach((klass: ClassDeclaration) => {
  const queue = [];
  const sortedMethods = klass
    .getMethods()
    .sort((a, b) => {
      // sort by public/protected/private then by name
      const aModifier = getModifier(a);
      const bModifier = getModifier(b);
      if (aModifier !== bModifier) {
        return bModifier - aModifier;
      }
      return a.getName() < b.getName() ? -1 : 1;
    })
    .map((method) => {
      console.log(getModifier(method), method.getName());
      return method.getFullText();
    });

  klass
    .getMethods()
    .reverse()
    .forEach((method) => {
      const range: [number, number] = [method.getFullStart(), method.getEnd()];
      queue.push(() => {
        klass.replaceText(range, `\n${sortedMethods.pop()!}\n`);
      });
    });

  queue.forEach((fn) => fn());

  if (klass.getText().length > 1000) {
    return;
  }
  console.log(klass.getFullText());
});

project.saveSync();
