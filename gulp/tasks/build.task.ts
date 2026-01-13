import { src } from "gulp";
import { transformTS } from "../transform";
const { dest } = require('gulp');
const del = require('del');
const change = require('gulp-change');
const { BUILD_PATH, WATCHED_TS_TYPES, WATCHED_OTHER_TYPES, SRC_PATH, EXCLUDE_PATHS } = require('../consts');
const config = require('../../gulp.config')

export const build = async (done) => {
  await del(BUILD_PATH);

  const tagMode = config.work_mode;
  const isFile = config.is_file;

  WATCHED_TS_TYPES.forEach(x => {
    transformTS([x, ...EXCLUDE_PATHS])
      .pipe(change((content) => {
        if(isFile) {
          return ((tagMode === "custom_web_template") ? `\ufeff<%\n${content}\n%>` : `\ufeff${content}`);
        } else {
          return ((tagMode === "custom_web_template") ? `<%\n${content}\n%>` : content);
        }
      }))
      .pipe(dest(BUILD_PATH));
  });

  WATCHED_OTHER_TYPES.forEach(x => {
    src(x, { base: SRC_PATH })
      .pipe(dest(BUILD_PATH));
  });

  done();
};