import fsextra from "fs-extra";

export function cleanGenerated() {
  fsextra.emptyDirSync("generated");
}

export function printGeneratedFiles() {
  fsextra.readdirSync("generated").forEach((file) => {
    console.log(file);
    console.log(fsextra.readFileSync(`generated/${file}`, "utf8"));
  });
}
