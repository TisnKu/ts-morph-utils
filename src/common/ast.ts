import {
  ExportedDeclarations,
  ImportSpecifier,
  SourceFile,
  SyntaxKind,
} from "ts-morph";

export function findDeclaration(
  namedImport: ImportSpecifier
): ExportedDeclarations {
  return namedImport
    ?.getImportDeclaration()
    .getModuleSpecifierSourceFile()
    ?.getExportedDeclarations()
    .get(namedImport.getName())?.[0];
}

export function findImportedDeclaration(
  name: string,
  sourceFile: SourceFile
): ExportedDeclarations {
  const namedImport = sourceFile.getFirstDescendant(
    (node) =>
      node.getKind() === SyntaxKind.ImportSpecifier && node.getText() === name
  );

  return findDeclaration(namedImport as ImportSpecifier);
}
