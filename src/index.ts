import { Identifier, Project, SyntaxKind, Node, NamedImports, ImportClause, ImportDeclaration } from "ts-morph";
import * as _ from 'lodash';

(function() {
  const project = new Project();
  project.addSourceFilesAtPaths('./src/test/**/*.ts');
  
  const sourceFile = project.getSourceFile(sourceFile => {
    const firstVariableDeclaration = sourceFile.getFirstDescendantByKind(SyntaxKind.VariableDeclaration);
    return !!firstVariableDeclaration?.hasExportKeyword();
  });

  const otherSourceFile = project.getSourceFiles().filter(s => s !== sourceFile);
  
  const variableDeclaration = sourceFile.getFirstDescendantByKind(SyntaxKind.VariableDeclaration);

  variableDeclaration.findReferencesAsNodes()
  const queue = [];
  _.chain(otherSourceFile)
    .map(s => s.getDescendantsOfKind(SyntaxKind.Identifier))
    .flatten()
    .filter(identifier => identifier.getText() === variableDeclaration.getName()).value().forEach(i => {
      const definitionNode: Node = i.getDefinitionNodes()?.[0];
      if(definitionNode === variableDeclaration) {
        console.log('matched');

        const belongingImportSpecifier: Node = (i as Identifier).getFirstAncestorByKind(SyntaxKind.ImportSpecifier);
        if(Node.isImportSpecifier(belongingImportSpecifier)) {
          const importDeclaration: ImportDeclaration = belongingImportSpecifier.getFirstAncestorByKind(SyntaxKind.ImportDeclaration);
          // queue.push(() => {
          //   if(belongingImportSpecifier.getParent().getElements().length > 1) {
          //     belongingImportSpecifier.remove();
          //   } else if(importDeclaration.getDefaultImport()) {
          //     importDeclaration.removeNamedImports();
          //   } else {
          //     importDeclaration.remove();
          //   }
          // })
          
        } else {
          queue.push(() => i.replaceWithText(variableDeclaration.getInitializer().getText()));
        }
      }
    });
    queue.push(() => variableDeclaration.remove());
    queue.forEach(caller => caller());
    if(_.isEmpty(_.trim(sourceFile.getFullText(), [' ', '\r', '\n']))) {
      sourceFile.delete();
    }
    otherSourceFile.forEach(f => f.fixUnusedIdentifiers());
    project.save();
})();
