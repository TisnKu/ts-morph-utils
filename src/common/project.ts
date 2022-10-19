import { Project } from "ts-morph";

export function createProject({ tsConfigFilePath, projectPath }) {
  if (tsConfigFilePath) {
    return new Project({
      tsConfigFilePath,
    });
  }
  const project = new Project();
  project.addSourceFilesAtPaths(`${projectPath}/**/*.ts`);
  project.addSourceFilesAtPaths(`${projectPath}/**/*.tsx`);
  return project;
}
