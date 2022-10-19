import readline from "readline";
import _ from "lodash";

const askQuestion = (query: string) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
};

export const commonUtils = {
  askQuestion,
};
