import _ from 'lodash';
import { BinaryExpression, Node, ParenthesizedExpression, SyntaxKind } from 'ts-morph';
import { createProject } from '../common/project';

export default function (tsConfigFilePath?: string, projectPath?: string) {
  const project = createProject({
    tsConfigFilePath,
    projectPath,
  });

  const queue = [];

  const sourceFile = project.getSourceFile('./src/test/simplifyCondition.ts');

  let canOptimize = true;
  let round = 1;
  while (canOptimize) {
    canOptimize = false;
    console.log('Round: ', round++);

    sourceFile.getDescendantsOfKind(SyntaxKind.TrueKeyword)
      .map(k => {
        const b = k.getFirstAncestorByKind(SyntaxKind.BinaryExpression);
        console.log(b?.getFullText());
        return b;
      })
      .filter(k => k)
      .slice(0, 1)
      .forEach(binaryExpression => {
        if (Node.is(SyntaxKind.BarBarToken)(binaryExpression.getOperatorToken())) {
          binaryExpression.replaceWithText('true');
          canOptimize = true;
        } else if (Node.is(SyntaxKind.AmpersandAmpersandToken)(binaryExpression.getOperatorToken())) {
          if (Node.isTrueLiteral(binaryExpression.getLeft())) {
            binaryExpression.replaceWithText(binaryExpression.getRight().getFullText());
          } else {
            binaryExpression.replaceWithText(binaryExpression.getLeft().getFullText());
          }
          canOptimize = true;
        }
      });

    sourceFile.getDescendantsOfKind(SyntaxKind.FalseKeyword)
      .map(k => k.getFirstAncestorByKind(SyntaxKind.BinaryExpression))
      .filter(k => k)
      .slice(0, 1)
      .forEach(binaryExpression => {
        if (Node.is(SyntaxKind.AmpersandAmpersandToken)(binaryExpression.getOperatorToken())) {
          binaryExpression.replaceWithText('false');
          canOptimize = true;
        } else if (Node.is(SyntaxKind.BarBarToken)(binaryExpression.getOperatorToken())) {
          if (Node.isFalseLiteral(binaryExpression.getLeft())) {
            binaryExpression.replaceWithText(binaryExpression.getRight().getFullText());
          } else {
            binaryExpression.replaceWithText(binaryExpression.getLeft().getFullText());
          }
          canOptimize = true;
        }
      });

    sourceFile.getDescendantsOfKind(SyntaxKind.ParenthesizedExpression)
      .reverse()
      .forEach((expression: ParenthesizedExpression) => {
        if (Node.isTrueLiteral(expression.getExpression())
          || Node.isFalseLiteral(expression.getExpression())) {
          // || Node.isIdentifier(expression.getExpression())) {
          expression.replaceWithText(expression.getExpression().getFullText());
          canOptimize = true;
        }
      });

    sourceFile.getDescendantsOfKind(SyntaxKind.IfStatement)
      .map(e => e.getExpression())
      .filter(Node.isParenthesizedExpression)
      .forEach(e => {
        console.log(e.getFullText());
        e.replaceWithText(e.getExpression().getFullText());
        canOptimize = true;
      });
  }


  sourceFile.formatText();
  console.log(sourceFile.getFullText());
  // project.saveSync();
})();


function isNode(...kinds) {
  return node => {
    return kinds.indexOf(node.kind) !== -1;
  };
}

function simplifyBinaryExpression(binaryExpression: BinaryExpression): boolean {
  const left = binaryExpression.getLeft();
  const right = binaryExpression.getRight();
  const operator = binaryExpression.getOperatorToken();

  if (!Node.isTrueLiteral(left)
    && !Node.isTrueLiteral(right)
    && !Node.isFalseLiteral(left)
    && !Node.isFalseLiteral(right)) {
    return false;
  }

  if (Node.isTrueLiteral(left)) {
    return Node.is(SyntaxKind.AmpersandAmpersandToken)(binaryExpression.getOperatorToken())
  }

  if (Node.is(SyntaxKind.AmpersandAmpersandToken)(binaryExpression.getOperatorToken())) {
    binaryExpression.replaceWithText('false');
  } else if (Node.is(SyntaxKind.BarBarToken)(binaryExpression.getOperatorToken())) {
    if (Node.isFalseLiteral(binaryExpression.getLeft())) {
      binaryExpression.replaceWithText(binaryExpression.getRight().getFullText());
    } else {
      binaryExpression.replaceWithText(binaryExpression.getLeft().getFullText());
    }
  }

  return true;
}

function stripUselessParenthesis(parenthesizedExpression: ParenthesizedExpression): boolean {
  const expression = parenthesizedExpression.getExpression();

  if (_.includes(KINDS_NO_NEED_PARENTHESIS, expression.getKind())) {
    parenthesizedExpression.replaceWithText(expression.getFullText());
    return true;
  }

  return false;
}

const KINDS_NO_NEED_PARENTHESIS: SyntaxKind[] = [
  SyntaxKind.FalseKeyword,
  SyntaxKind.TrueKeyword,
  SyntaxKind.PropertyAccessExpression,
  SyntaxKind.Identifier
];
