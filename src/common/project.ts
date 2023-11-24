import fs from "fs";
import { Project } from "ts-morph";

export function createProject({
  tsConfigFilePath,
  projectPath,
  filePath,
}): Project {
  if (tsConfigFilePath) {
    return new Project({
      tsConfigFilePath,
    });
  }

  const project = new Project();
  if (filePath) {
    project.addSourceFileAtPath(filePath);
    return project;
  }

  const subdirectories = fs.readdirSync(projectPath);
  for (const subdirectory of subdirectories) {
    if (subdirectory === "node_modules") {
      continue;
    }
    if (fs.statSync(`${projectPath}/${subdirectory}`).isDirectory()) {
      project.addSourceFilesAtPaths(
        `${projectPath}/${subdirectory}/**/*.{ts, tsx}`
      );
      continue;
    }
    if (subdirectory.endsWith(".ts") || subdirectory.endsWith(".tsx")) {
      project.addSourceFileAtPath(`${projectPath}/${subdirectory}`);
    }
  }
  return project;
}
