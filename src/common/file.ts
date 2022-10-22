export function getRelativePath(path1: string, path2: string): string {
  const path1Parts = path1.split("/");
  const path2Parts = path2.split("/");

  const commonPath = findCommonPath(path1Parts, path2Parts);
  const trail = removeFileExtension(
    `${path2Parts.slice(commonPath.length).join("/")}`
  );

  if (commonPath.length === path1Parts.length - 1) {
    return `./${trail}`;
  } else {
    return "../".repeat(path1Parts.length - commonPath.length - 1) + trail;
  }
}

function findCommonPath(path1Parts: string[], path2Parts: string[]): string[] {
  const commonPath = [];
  for (let i = 0; i < path1Parts.length; i++) {
    if (path1Parts[i] === path2Parts[i]) {
      commonPath.push(path1Parts[i]);
    } else {
      break;
    }
  }
  return commonPath;
}

function removeFileExtension(path: string): string {
  return path.replace(/\.[^/.]+$/, "");
}
