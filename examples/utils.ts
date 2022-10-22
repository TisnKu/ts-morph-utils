import fsextra from "fs-extra";

export function cleanGenerated() {
  fsextra.emptyDirSync("generated");
}
