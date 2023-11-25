import {
  ClassDeclaration,
  MethodDeclaration,
  Project,
  SourceFile,
  SyntaxKind,
} from "ts-morph";

export default function (project: Project) {
  project.getSourceFiles().forEach(fixMemberOrdering);

  project.saveSync();
}

const getModifier = (method: MethodDeclaration) =>
  method
    .getModifiers()
    .find((m) =>
      [
        SyntaxKind.PublicKeyword,
        SyntaxKind.ProtectedKeyword,
        SyntaxKind.PrivateKeyword,
      ].includes(m.getKind())
    );

function fixMemberOrdering(sourceFile: SourceFile) {
  sourceFile.getClasses().forEach((klass: ClassDeclaration) => {
    const queue = [];
    const sortedMethods = klass
      .getMethods()
      .sort((a, b) => {
        // sort by public/protected/private then by name
        const aModifier = getModifier(a).getKind();
        const bModifier = getModifier(b).getKind();
        if (aModifier !== bModifier) {
          return bModifier - aModifier;
        }
        return a.getName() < b.getName() ? -1 : 1;
      })
      .map((method) => {
        console.log(getModifier(method).getText(), method.getName());
        return method.getFullText();
      });

    klass
      .getMethods()
      .reverse()
      .forEach((method) => {
        const range: [number, number] = [
          method.getFullStart(),
          method.getEnd(),
        ];
        queue.push(() => {
          klass.replaceText(range, `\n${sortedMethods.pop()!}\n`);
        });
      });

    queue.forEach((fn) => fn());
  });
}
