const ESLINT_SINGLE_LINE = /^\s*\/\/\s*eslint[^\n]*\r?\n?/gm;
const ESLINT_MULTI_LINE = /^\s*\/\*+\s*eslint[\s\S]*?\*+\/\r?\n?/gm;
const UNICODE_REGEX = /\\u([0-9a-fA-F]{4})/g;
const NEWLINE_REGEX = /\\n/g;
const TAB_REGEX = /\\t/g;
const EXPORT_REGEXP = /^(export\s{[^;]*};?)$/gm;
const IMPORT_REGEXP = /^(import\s[^;]*";?)$/gm;
const FUNC_EXPORT_REGEXP = /\bexport\b\s+/g;

type ContentTransformer = (content: string) => string;

export const replaceContent = (...transformers: ContentTransformer[]) => 
  (content: string) => transformers.reduce((acc, fn) => fn(acc), content);

export const contentReplacer = {
  replaceImportsExports: (content: string) => 
    [IMPORT_REGEXP, EXPORT_REGEXP, FUNC_EXPORT_REGEXP]
      .reduce((acc, regex) => acc.replace(regex, ""), content),

  replaceMultilines: (content: string) =>
    content
      .replace(NEWLINE_REGEX, '\\\n')
      .replace(TAB_REGEX, '\t'),

  replaceUnicode: (content: string) =>
    content.replace(UNICODE_REGEX, (_, hex) => 
      String.fromCharCode(parseInt(hex, 16))),

  removeEslintComments: (content: string) =>
    content
      .replace(ESLINT_SINGLE_LINE, '')
      .replace(ESLINT_MULTI_LINE, '')
};