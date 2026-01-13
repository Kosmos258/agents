# Памятка по библиотеке DPrint для автоформатирования кода

### [Ссылка на документацию](https://dprint.dev/config/)

## Пример файла конфигурации

```
{
  "lineWidth": 80,
  "typescript": {
    // This applies to both JavaScript & TypeScript
    "quoteStyle": "preferSingle",
    "binaryExpression.operatorPosition": "sameLine"
  },
  "json": {
    "indentWidth": 2
  },
  "excludes": [
    "**/*-lock.json"
  ],
  "plugins": [
    // You may specify any urls or file paths here that you wish.
    "https://plugins.dprint.dev/typescript-0.95.3.wasm",
    "https://plugins.dprint.dev/json-0.20.0.wasm",
    "https://plugins.dprint.dev/markdown-0.18.0.wasm"
  ]
}
```

## Plugins

Свойство plugins указывает, какие плагины использовать для форматирования. Это могут быть как URL-адреса, так и пути к файлу WebAssembly плагинов.

```json
{
  // ...omitted...
  "plugins": [
    // You may specify any urls or file paths here that you wish.
    "https://plugins.dprint.dev/typescript-0.95.3.wasm",
    "https://plugins.dprint.dev/json-0.20.0.wasm",
    "https://plugins.dprint.dev/markdown-0.18.0.wasm"
  ]
}
```

## Excludes

Свойство excludes указывает пути к файлам, которые необходимо игнорировать при форматировании.

Паттерны пишутся как глоббинги в [gitignore](https://git-scm.com/docs/gitignore#_pattern_format).

```json
{
  // ...omitted...
  "excludes": [
    "**/*-lock.json"
  ]
}
```

Файлы, добавленные в gitignore, игнорируются форматером по умолчанию, но это можно обойти с помощью специальной формы записи пути: 

```json
{
  "excludes": [
    // will format dist.js even though it's gitignored
    "!dist.js"
  ]
}
```

## Includes

Свойство includes можно использовать для форматирования только определенных файлов. Свойство не является обязательным .

```json
{
  // ...omitted...
  "includes": [
    "src/**/*.{ts,tsx,js,jsx,json}"
  ]
}
```

**Ниже будет подробно описан конфиг файл этого шаблона**

### typescript

| Параметр                                                        | Значения                                                            | Описание                                                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `lineWidth`                                                     | `number`                                                            | Максимальное кол-во символов в одной строке                                                       |
| `indentWidth`                                                   | `number`                                                            | Количество символов в отступе                                                                     |
| `useTabs`                                                       | `boolean`                                                           | Использовать табы для отступов                                                                    |
| `semicolons`                                                    | `"always"` / `"prefer"` / `"asi"`                                   | Точка с запятой в конце выражений.                                                                |
| `quoteStyle`                                                    | `"alwaysDouble"`/`"alwaysSingle"`/`"preferDouble"`/`"preferSingle"` | Тип кавычек                                                                                       |
| `quoteProps`                                                    | `"asNeeded"` / `"consistent"` / `"preserve"`                        | Кавычки в именах свойств объектов                                                                 |
| `newLineKind`                                                   | `"auto"` / `"crlf"` / `"lf"`/ `"system"`                            | Тип обозначения конца строки                                                                      |
| `useBraces`                                                     | `"maintain"`/`"whenNotSingleLine"`/`"always"`/`"preferNone"`        | Фигурные скобки в выражениях                                                                      |
| `bracePosition`                                                 | `"maintain"` / `"sameLine"`/ `"nextLine"`/ `"nextLine"`             | Расположение открывающей фигурной скобки в выражениях                                             |
| `singleBodyPosition`                                            | `"maintain"`/`"sameLine"`/`"nextLine"`                              | Где разместить тело выражения, если оно помещается в одну строку (ex `if (true) console.log(5);`) |
| `nextControlFlowPosition`                                       | `"maintain"` / `"sameLine"` / `"nextLine"`                          | Расположение условия следующего выражения (ex `else if`)                                          |
| `trailingCommas`                                                | `"never"` / `"always"` / `"onlyMultiLine"`                          | Запятая после последнего элемента (ex свойства объектов)                                          |
| `operatorPosition`                                              | `"maintain"` / `"sameLine"` / `"nextLine  "`                        | Расположение операторов в условии, когда оно слишком длинное                                      |
| `preferHanging`                                                 | `boolean`                                                           | Оставлять перечисления в одну строку вместо разбиения на несколько строк. (ex `if` с 5 условиями) |
| `preferSingleLine`                                              | `boolean`                                                           | Предпочитать запись в одну строку                                                                 |
| `arrowFunction.useParentheses`                                  | `boolean`                                                           | Скобки у параметров в стрелочных функциях                                                         |
| `binaryExpression.linePerExpression`                            | `boolean`                                                           | Строка для каждого выражения, когда занимает больше 1 строки (ex 10 операторов сложения)          |
| `memberExpression.linePerExpression`                            | `boolean`                                                           | Чейнинг методов в несколько строк, когда цепочка длиннее заданной ширины                          |
| `typeLiteral.separatorKind`                                     | `"semiColon"` / `"comma"`                                           | Тип разделителя в типах                                                                           |
| `enumDeclaration.memberSpacing`                                 | `"newLine"` / `"blankLine"` / `"maintain"`                          | Разделение значений в enum                                                                        |
| `spaceAround`                                                   | `boolean`                                                           | Пробелы вокруг выражений в скобках (ex `myFunction( true )`)                                      |
| `spaceSurroundingProperties`                                    | `boolean`                                                           | Пробелы вокруг свойств объекта (ex `{ key: value `)                                               |
| `binaryExpression.spaceSurroundingBitwiseAndArithmeticOperator` | `boolean`                                                           | Пробелы вокруг мат. выражений (ex `1 + 2`)                                                        |
| `commentLine.forceSpaceAfterSlashes`                            | `boolean`                                                           | Пробелы после `//` в комментариях (ex `// comment`)                                               |
| `constructorType.spaceAfterNewKeyword`                          | `boolean`                                                           | Пробел после new в конструкторах типов (ex `type MyClassCtor = new () => MyClass`)                |
| `constructSignature.spaceAfterNewKeyword`                       | `boolean`                                                           | Пробел после new в конструкторах сигнатур(ex `new (): MyClass;`)                                  |
| `doWhileStatement.spaceAfterWhileKeyword`                       | `boolean`                                                           | Пробел после while в `do {} while ()`                                                             |
| `whileStatement.spaceAfterWhileKeyword`                         | `boolean`                                                           | Пробел после `while` в `while (){}`                                                               |
| `forInStatement.spaceAfterForKeyword`                           | `boolean`                                                           | Пробел после `for` в циклах `for in`                                                              |
| `forOfStatement.spaceAfterForKeyword`                           | `boolean`                                                           | Пробел после `for` в циклах `for of`                                                              |
| `forStatement.spaceAfterForKeyword`                             | `boolean`                                                           | Пробел после `for` в циклах `for (..; ..; ..)`                                                    |
| `forStatement.spaceAfterSemiColons`                             | `boolean`                                                           | Пробел после `;` в циклах `for`                                                                   |
| `functionDeclaration.spaceBeforeParentheses`                    | `boolean`                                                           | Пробел перед скобками при объявлении функции (ex `function myFunction ()`)                        |
| `functionExpression.spaceBeforeParentheses`                     | `boolean`                                                           | Пробел перед скобками в функциональном выражения (ex `function<T> ()`)                            |
| `functionExpression.spaceAfterFunctionKeyword`                  | `boolean`                                                           | Пробел после `function` при объявлении функции (ex `function <T>()`)                              |
| `ifStatement.spaceAfterIfKeyword`                               | `boolean`                                                           | Пробел после `if`                                                                                 |
| `exportDeclaration.spaceSurroundingNamedExports`                | `boolean`                                                           | Пробелы в именуемых экспортах (ex `export { SomeExport, OtherExport };`)                          |
| `importDeclaration.spaceSurroundingNamedImports`                | `boolean`                                                           | Пробелы в именуемых импортах (ex `import { SomeExport, OtherExport } from 'my-module';`)          |
| `method.spaceBeforeParentheses`                                 | `boolean`                                                           | Проблем перед скобками в методах (ex `myMethod ()`)                                               |
| `typeAnnotation.spaceBeforeColon`                               | `boolean`                                                           | Пробел перед двоеточием в аннотации типа у функции (ex `function myFunction() : string`)          |
| `typeAssertion.spaceBeforeExpression`                           | `boolean`                                                           | Пробел перед выражением присвоения типа (ex `<string> myValue`)                                   |
| `module.sortImportDeclarations`                                 | `"maintain"` / `"caseInsensitive"` / `"caseSensitive"`              | Тип сортировки импортов                                                                           |
| `module.sortExportDeclarations`                                 | `"maintain"` / `"caseInsensitive"` / `"caseSensitive"`              | Тип сортировки экспортов                                                                          |
| `importDeclaration.sortNamedImports`                            | `"maintain"` / `"caseInsensitive"` / `"caseSensitive"`              | Сортировка именуемых импортов                                                                     |
| `exportDeclaration.sortNamedExports`                            | `"maintain"` / `"caseInsensitive"` / `"caseSensitive"`              | Сортировка именуемых экспортов                                                                    |
| `ignoreNodeCommentText`                                         | `string`                                                            | Директива для отключения форматирования у блока кода (ex `"dp-ignore"`)                           |
| `ignoreFileCommentText`                                         | `string`                                                            | Директива для отключения форматирования у всего файла (ex `"dp-ignore-file"`)                     |
| `exportDeclaration.forceSingleLine`                             | `boolean`                                                           | Принудительное форматирование экспортов в 1 строку                                                |
| `importDeclaration.forceSingleLine`                             | `boolean`                                                           | Принудительное форматирование импортов в 1 строку                                                 |
| `exportDeclaration.forceMultiLine`                              | `"always"`/ `"never"` / `"whenMultiple"`                            | Принудительное форматирование экспортов в несколько строк                                         |
| `importDeclaration.forceMultiLine`                              | `"always"`/ `"never"` / `"whenMultiple"`                            | Принудительное форматирование импортов в несколько строк                                          |


### json

| Параметр                             | Значения                                     | Описание                                                         |
| ------------------------------------ | -------------------------------------------- | ---------------------------------------------------------------- |
| `lineWidth`                          | `number`                                     | Максимальное кол-во символов в одной строке                      |
| `indentWidth`                        | `number`                                     | Количество символов в отступе                                    |
| `useTabs`                            | `boolean`                                    | Использовать табы для отступов                                   |
| `newLineKind`                        | `"auto"`/ `"lf"` / `"crlf"` / `"system"`     | Тип обозначения конца строки                                     |
| `commentLine.forceSpaceAfterSlashes` | `boolean`                                    | Пробел после `//` в комментариях                                 |
| `preferSingleLine`                   | `boolean`                                    | Значения свойств в одну строку, когда возможно                   |
| `trailingCommas`                     | `"always"`/`"jsonc"`/`"maintain"` /`"never"` | Запятая после последнего перечисляемого элемента                 |
| `ignoreNodeCommentText`              | `string`                                     | Директива для отключения форматирования (ex. `// dprint-ignore`) |
