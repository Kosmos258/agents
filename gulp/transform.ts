import {SsjsProjectBuilder} from "@globexit/websoft-types/lib/ssjs-transpiler";

const {src} = require('gulp');
const include = require('gulp-include');
const change = require('gulp-change');
const createProject = require('gulp-typescript').createProject;
const eslint = require('gulp-eslint');
const plumber = require('gulp-plumber');

import {SRC_PATH, TS_CONFIG_PATH} from "./consts";
import { contentReplacer, replaceContent } from "./utils/replace";

const {transformerConfigurator, importManager} = new SsjsProjectBuilder()
    .setTsConfigPath(TS_CONFIG_PATH)
    .build();

const dotenv = require('dotenv');
dotenv.config();

const fullReplace = replaceContent(
    contentReplacer.replaceImportsExports,
    contentReplacer.replaceMultilines,
    contentReplacer.replaceUnicode,
    contentReplacer.removeEslintComments,
);

export const transformTS = (path) => {
    return src(path, {base: SRC_PATH})
        .pipe(plumber({
            errorHandler: function(err) {
                console.error(err);
                this.emit('end');
            }
        }))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(change(importManager.addFuncImports))
        .pipe(change(importManager.replaceImports))
        .pipe(include({
            extensions: 'ts',
            hardFail: true,
            separateInputs: true,
            includePaths: [
                __dirname + "../../node_modules"
            ]
        }))
        .pipe(createProject(TS_CONFIG_PATH, {
            typescript: transformerConfigurator.ts,
            getCustomTransformers: () => ({
                before: transformerConfigurator.getTransformers()
            })
        })())
        .pipe(change(fullReplace))
        .on("error", (error) => {console.log(`🛑 Transpilation error: ${error}`)})
        .on("end", () => {
            console.log(`☑️   ESLint check completed for "${Array.isArray(path) ? path.filter(item => !item.includes('!')) : path}"`);
            console.log(`-------------------------------------------------------------`);
            console.log(`✅ File "${Array.isArray(path) ? path.filter(item => !item.includes('!')) : path}" transpiled successfully [${new Date().toLocaleTimeString()}] 🕙\n`)
        });
};
