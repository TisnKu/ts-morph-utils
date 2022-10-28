import {
  ExportedDeclarations,
  Expression,
  Project,
  SourceFile,
  SyntaxKind,
} from "ts-morph";
import { deleteNamedImport } from "../common/ast";

export default function (project: Project) {
  const teamsCallInterface = project.getSourceFileOrThrow(
    process.env.TEAMS_CALL_PATH
  );
  const insertedSourceFiles = new Set<SourceFile>();
  teamsCallInterface.getExportedDeclarations().forEach((declarations) => {
    const declaration = declarations[0] as Exclude<
      ExportedDeclarations,
      SourceFile | Expression
    >;
    declaration.findReferencesAsNodes().forEach((ref) => {
      const imp = ref.getFirstAncestorByKind(SyntaxKind.ImportDeclaration);
      if (imp) {
        const sourceFile = imp.getSourceFile();
        const importDeclarations = sourceFile.getChildrenOfKind(
          SyntaxKind.ImportDeclaration
        );
        const exportDeclarations = sourceFile.getChildrenOfKind(
          SyntaxKind.ExportDeclaration
        );
        if (!insertedSourceFiles.has(sourceFile)) {
          sourceFile.insertStatements(
            importDeclarations.length + exportDeclarations.length,
            "import TeamsCall = teams.calling.TeamsCall;"
          );
          insertedSourceFiles.add(sourceFile);
        }
        deleteNamedImport(
          ref.getFirstAncestorByKind(SyntaxKind.ImportSpecifier)
        );
      }
    });
  });
  project.saveSync();
}
