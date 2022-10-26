import _ from "lodash";
import {
  ExportedDeclarations,
  ExportSpecifier,
  Expression,
  ImportSpecifier,
  Node,
  Project,
  SourceFile,
  SyntaxKind,
} from "ts-morph";
import { getRelativePath } from "./file";

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

export function getOrCreateInterfaceFile(sourceFile: SourceFile): SourceFile {
  const interfaceFileName = sourceFile
    .getFilePath()
    .replace(".ts", ".interface.ts");
  return (
    sourceFile.getProject().getSourceFile(interfaceFileName) ||
    sourceFile.getProject().createSourceFile(interfaceFileName, "")
  );
}

export function getOrCreateFile(
  project: Project,
  filePath: string
): SourceFile {
  return (
    project.getSourceFile(filePath) || project.createSourceFile(filePath, "")
  );
}

export function addNamedImport(
  sourceFile: SourceFile,
  name: string,
  moduleSpecifier: string,
  alias?: string
): ImportSpecifier {
  const existingImport = sourceFile.getImportDeclaration(moduleSpecifier);

  const importSpecifier = !!alias && alias !== name ? { name, alias } : name;
  if (!existingImport) {
    return sourceFile
      .addImportDeclaration({
        namedImports: [importSpecifier],
        moduleSpecifier,
      })
      .getNamedImports()[0];
  }

  if (
    existingImport
      .getNamedImports()
      .some((namedImport) => namedImport.getName() === name)
  ) {
    return;
  }

  return existingImport.addNamedImport(importSpecifier);
}

export function addNamedExport(
  sourceFile: SourceFile,
  name: string,
  moduleSpecifier: string,
  alias?: string
): ExportSpecifier {
  const existingExport = sourceFile.getExportDeclaration(moduleSpecifier);

  const exportSpecifier = !!alias && alias !== name ? { name, alias } : name;
  if (!existingExport) {
    return sourceFile
      .addExportDeclaration({
        namedExports: [exportSpecifier],
        moduleSpecifier,
      })
      .getNamedExports()[0];
  }

  if (
    existingExport
      .getNamedExports()
      .some((namedExport) => namedExport.getName() === name)
  ) {
    return;
  }

  return existingExport.addNamedExport(exportSpecifier);
}

export function deleteNamedImport(namedImport: ImportSpecifier) {
  if (namedImport.getImportDeclaration().getNamedImports().length === 1) {
    namedImport.getImportDeclaration().remove();
  } else {
    namedImport.remove();
  }
}

export function deleteNamedExport(namedExport: ExportSpecifier) {
  if (namedExport.getExportDeclaration().getNamedExports().length === 1) {
    namedExport.getExportDeclaration().remove();
  } else {
    namedExport.remove();
  }
}

export function moveDeclaration(
  declaration: Exclude<ExportedDeclarations, Expression | SourceFile>,
  to: SourceFile
): void {
  console.log("moveDeclaration", declaration.getText(), "to", to.getFilePath());
  const aliasMap = new Map<string, string>();
  const name = declaration.getName();
  const from = declaration.getSourceFile();
  const refs: Array<
    [Node, ImportSpecifier | undefined, ExportSpecifier | undefined]
  > = _.uniqBy(
    declaration
      .findReferencesAsNodes()
      .map((ref) => [
        ref,
        ref.getFirstAncestorByKind(SyntaxKind.ImportSpecifier),
        ref.getFirstAncestorByKind(SyntaxKind.ExportSpecifier),
        `${ref
          .getSourceFile()
          .getFilePath()}:${ref.getStartLineNumber()}:${ref.getStartLinePos()}`,
      ])
      .filter((ref) => ref[1] || ref[2]),
    (ref) => ref[3]
  ) as any;

  refs.forEach(([ref, namedImport, namedExport]) => {
    const sourceFile = ref.getSourceFile();
    if (namedImport) {
      aliasMap.set(
        sourceFile.getFilePath(),
        namedImport.getAliasNode()?.getText()
      );
      deleteNamedImport(namedImport);
    }

    if (from == sourceFile || (namedImport && sourceFile !== to)) {
      addNamedImport(
        sourceFile,
        name,
        getRelativePath(sourceFile.getFilePath(), to.getFilePath()),
        aliasMap.get(sourceFile.getFilePath())
      );
    }

    if (namedExport) {
      aliasMap.set(
        sourceFile.getFilePath(),
        namedExport.getAliasNode()?.getText()
      );
      deleteNamedExport(namedExport);

      addNamedExport(
        sourceFile,
        name,
        getRelativePath(sourceFile.getFilePath(), to.getFilePath()),
        aliasMap.get(sourceFile.getFilePath())
      );
    }
  });

  to.addStatements(declaration.getText());
  declaration.remove();
  to.fixMissingImports();
  if (from.getStatements().length === 0) {
    from.delete();
  }
}
