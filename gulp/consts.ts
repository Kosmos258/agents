import { posix } from "path";
const { join } = posix;
const config = require('../gulp.config')

export const SRC_PATH = config.basePaths.entry;
export const TS_CONFIG_PATH = join(SRC_PATH, "tsconfig.json");
export const BUILD_PATH = config.basePaths.build;

export const WATCHED_TS_TYPES = config.filePatterns.ts.map(
  pattern => join(SRC_PATH, pattern)
);

export const EXCLUDE_PATHS = config.excludePaths.map(
  pattern => `!${join(SRC_PATH, pattern)}`
);

export const WATCHED_OTHER_TYPES = config.filePatterns.other.map(
  pattern => join(SRC_PATH, pattern)
);
