enum LogLevel {
  VERBOSE = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}
var logLevel = LogLevel.INFO;

export const setLogLevel = (level: string) => {
  switch (level) {
    case "INFO":
      logLevel = LogLevel.INFO;
      break;
    case "WARN":
      logLevel = LogLevel.WARN;
      break;
    case "ERROR":
      logLevel = LogLevel.ERROR;
      break;
    default:
      logLevel = LogLevel.INFO;
  }
};

export const logger = {
  verbose: (message: string) => {
    if (logLevel <= LogLevel.VERBOSE) {
      console.log(message);
    }
  },
  info: (message: string) => {
    if (logLevel <= LogLevel.INFO) {
      console.log(message);
    }
  },
  warn: (message: string) => {
    if (logLevel <= LogLevel.WARN) {
      console.warn(message);
    }
  },
  error: (message: string) => {
    if (logLevel <= LogLevel.ERROR) {
      console.error(message);
    }
  },
};
