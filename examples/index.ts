import fs from "fs";
import _ from "lodash";

const listAllExamples = () => {
  return fs
    .readdirSync("./examples")
    .map((fileName: string) => fileName.replace(".ts", ""));
};
const featureName = process.argv[2];
const filesNames = listAllExamples();
const matchedFile = filesNames.find((fileName: string) =>
  fileName.toLowerCase().includes(_.toLower(featureName))
);

require("./" + matchedFile);
