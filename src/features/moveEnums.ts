import {
  ClassDeclaration,
  EnumDeclaration,
  FunctionDeclaration,
  Project,
  SyntaxKind,
  VariableDeclaration,
} from "ts-morph";
import {
  findDeclaration,
  getOrCreateFile,
  moveDeclaration,
} from "../common/ast";

export default function (project: Project) {
  const enumsFile = project.getSourceFileOrThrow(process.env.ENUMS_PATH);
  const exportDeclarations = enumsFile.getExportDeclarations();
  exportDeclarations.forEach((exportDeclaration) => {
    const namedExports = exportDeclaration.getNamedExports();
    namedExports.forEach((namedExport) => {
      const declaration = findDeclaration(namedExport);
      if (declaration.getKind() === SyntaxKind.EnumDeclaration) {
        const filePath = declaration.getSourceFile().getFilePath();
        if (filePath.endsWith(".enum.ts")) {
          return;
        }
        moveDeclaration(
          declaration as EnumDeclaration,
          getOrCreateFile(
            project,
            filePath.endsWith(".interface.ts")
              ? filePath.replace(".interface.ts", ".enum.ts")
              : filePath.replace(".ts", ".enum.ts")
          )
        );
      } else if (declaration.getKind() === SyntaxKind.ClassDeclaration) {
        moveDeclaration(
          declaration as ClassDeclaration,
          getOrCreateFile(
            project,
            declaration
              .getSourceFile()
              .getFilePath()
              .replace(".ts", ".class.ts")
          )
        );
      } else if (declaration.getKind() === SyntaxKind.VariableDeclaration) {
        moveDeclaration(
          declaration as VariableDeclaration,
          getOrCreateFile(
            project,
            declaration
              .getSourceFile()
              .getFilePath()
              .replace(".ts", ".const.ts")
          )
        );
      } else if (declaration.getKind() === SyntaxKind.FunctionDeclaration) {
        moveDeclaration(
          declaration as FunctionDeclaration,
          getOrCreateFile(
            project,
            declaration
              .getSourceFile()
              .getFilePath()
              .replace(".ts", ".utils.ts")
          )
        );
      } else {
        moveDeclaration(
          declaration as any,
          getOrCreateFile(
            project,
            declaration
              .getSourceFile()
              .getFilePath()
              .replace(".ts", ".others.ts")
          )
        );
      }
    });
  });

  project.saveSync();
}
