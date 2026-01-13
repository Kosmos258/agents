import chalk from 'chalk';
import { existsSync } from "fs";
import { sendFiles } from "../sendFiles";
import { transformTS } from "../transform";
import { EXCLUDE_PATHS, WATCHED_OTHER_TYPES } from "../consts";

const { src, watch, dest } = require('gulp');
const eslint = require('gulp-eslint');
const change = require('gulp-change');
const { SRC_PATH, BUILD_PATH, WATCHED_TS_TYPES } = require('../consts');
const pathModule = require('path');
const config = require('../../gulp.config')

const tagMode = config.work_mode;
const isFile = config.is_file;

export const dev = (done) => {
  console.log(`\n-------------------------------------------------------------`);
  WATCHED_TS_TYPES.forEach(x => {
    watch([x, ...EXCLUDE_PATHS]).on("change", (path) => {
      console.log(`\n🚀 Build start...\n`);      
      transformTS(path)
        .pipe(change((content) => {
          if(isFile) {
            return ((tagMode === "custom_web_template") ? `\ufeff<%\n${content}\n%>` : `\ufeff${content}`);
          } else {
            return ((tagMode === "custom_web_template") ? `<%\n${content}\n%>` : content);
          }
        }))
        .pipe(dest(BUILD_PATH))
        .on('end', async () => {
          console.log(`🚀 Build end.`);
         
          if(config.is_need_deploy) {
            console.log(`\n🚀 Deploy start...`);
            if (existsSync(BUILD_PATH)) {
              const relativePath = pathModule.relative(SRC_PATH, path);
              const filePath = pathModule.join(BUILD_PATH, `${relativePath.replace(pathModule.extname(relativePath), '.js')}`);
              await sendFiles(filePath);
            } else {
              console.error(`Error: File not found in ${BUILD_PATH}`);
            }
            console.log(`🚀 Deploy end\n`);
          } 
        })
        .on("error", (error) => {
          console.error(`🚨 Build failed: ${error.message}`);
        });
    });

    console.log(`☑️   Watcher on "${x}" have started [change event]`);
  });
  
  WATCHED_OTHER_TYPES.forEach(x => {
    watch([x, ...EXCLUDE_PATHS]).on("change", (path) => {
      console.log(`\n🚀 Build start...`);
      src(path, { base: SRC_PATH })
        .pipe(dest(BUILD_PATH))
        .on('end', async () => {
          console.log(`\n🚀 Build end.`);

          if(config.is_need_deploy) {
            console.log(`\n🚀 Deploy start...`);

            if (existsSync(BUILD_PATH)) {
              const relativePath = pathModule.relative(SRC_PATH, path);
              const filePath = pathModule.join(BUILD_PATH, `${relativePath.replace(pathModule.extname(relativePath), '.js')}`);
              await sendFiles(filePath);
            } else {
              console.error(`Error: File not found in ${BUILD_PATH}`);
            }
            console.log(`🚀 Deploy end\n`);
          }
        });
    });

    console.log(`☑️   Watcher on "${x}" have started [change event]`);
  });
  console.log(`-------------------------------------------------------------\n`);
  done();
};