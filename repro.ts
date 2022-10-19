import { Project } from "ts-morph";

const project = new Project();
project.createSourceFile(
  "service.ts",
  `
export const a = 100;
`
);
project.createSourceFile(
  "service.interface.ts",
  `
export interface IA {}

export class ClassB {
  public errorCode: string;
}
`
);
project.createSourceFile(
  "service.mock.ts",
  `
import {
  IA,
} from "./service.interface";
import { ClassB } from "./service";

export class ClassC extends ClassB {}
export class ClassA implements IA {}
`
);

const queue = [];
project.getSourceFiles().forEach((sourceFile) => {
  return sourceFile.getImportDeclarations().forEach((declaration) => {
    declaration.getNamedImports().forEach((namedImport) => {
      if (!declaration.getModuleSpecifierValue().startsWith(".")) {
        return;
      }
      const sourceFileImported = declaration.getModuleSpecifierSourceFile();
      if (
        sourceFileImported === undefined ||
        !hasNamedExport(sourceFileImported, namedImport.getName())
      ) {
        queue.push(() => {
          namedImport.remove();
          if (declaration.getNamedImports().length === 0) {
            declaration.remove();
          }
          declaration.getSourceFile().fixMissingImports();
          return declaration.getSourceFile().getFilePath();
        });
      }
    });
  });
});

const optimizedFiles = queue.map((fn) => fn());
project.saveSync();

console.log(optimizedFiles.join("\n"));

function hasNamedExport(sourceFile, namedExport: string): boolean {
  return [...sourceFile.getExportedDeclarations().keys()].some(
    (name: string) => name === namedExport
  );
}
