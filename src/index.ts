import fs from "fs";
import _ from "lodash";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface Args {
  feature?: string;
  tsconfig?: string;
  project?: string;
}

const argv = yargs(hideBin(process.argv))
  .alias("f", "feature")
  .alias("p", "project")
  .alias("c", "tsconfig").argv as Args;

function requireFeature(fileName: string) {
  return require("./features/" + fileName);
}

const listAllFilesUnderFeatures = () => {
  return fs
    .readdirSync("src/features")
    .map((fileName: string) => fileName.replace(".ts", ""));
};
const featureName = argv.feature;
const filesNames = listAllFilesUnderFeatures();
const matchedFile = filesNames.find((fileName: string) =>
  fileName.toLowerCase().includes(_.toLower(featureName))
);

if (matchedFile) {
  const feature = requireFeature(matchedFile);
  if (feature.default) {
    console.log("Matched feature: ", matchedFile, "\n");
    console.log(
      "Running feature with arguments: ",
      _.pick(argv, ["project", "tsconfig"]),
      "\n"
    );
    feature.default(argv.tsconfig, argv.project);
  }
} else {
  console.log(
    matchedFile.length === 0
      ? "No Command Matched "
      : "More than 1 command matched: ",
    matchedFile
  );
}
