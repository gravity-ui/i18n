import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { red } from 'picocolors';
import { isLegacyPlural } from '@gravity-ui/i18n-types';
import fs2, { writeFile, readFile } from 'fs/promises';
import path, { resolve, parse, join, relative } from 'path';
import 'child_process';
import { builders } from 'estree-toolkit';
import { generate } from 'astring';
import parseIcuMessage from 'format-message-parse';
import createPrettyIcuMessage from 'format-message-print';
import { cosmiconfigSync } from 'cosmiconfig';
import { simpleTraverse } from '@typescript-eslint/typescript-estree';
import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { lstatSync, readdirSync, promises } from 'fs';
import { parse as parse$1 } from '@typescript-eslint/parser';

var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b2) => (typeof require !== "undefined" ? require : a)[b2]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// package.json
var require_package = __commonJS({
  "package.json"(exports, module2) {
    module2.exports = {
      name: "@gravity-ui/i18n-cli",
      version: "0.17.5",
      license: "MIT",
      main: "./dist/index.js",
      module: "./dist/index.mjs",
      types: "./dist/index.d.ts",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          import: "./dist/index.mjs",
          require: "./dist/index.js",
          default: "./dist/index.js"
        },
        "./config": {
          types: "./dist/config/index.d.ts",
          import: "./dist/config/index.mjs",
          require: "./dist/config/index.js",
          default: "./dist/config/index.js"
        },
        "./dist/*": {
          types: "./dist/*.d.ts"
        }
      },
      typesVersions: {
        "*": {
          config: [
            "dist/config/index.d.ts"
          ]
        }
      },
      files: [
        "bin",
        "dist"
      ],
      bin: {
        "i18n-cli": "./bin/i18n-cli.js"
      },
      scripts: {
        build: "pnpm run build:clean && pnpm run build:tsup && pnpm run build:bin",
        "build:tsup": "tsup",
        "build:bin": "chmod +x bin/i18n-cli.js",
        "build:clean": "rm -rf dist",
        lint: "eslint .",
        "lint:fix": "eslint . --fix",
        test: "jest",
        typecheck: "tsc --noEmit"
      },
      keywords: [
        "i18n"
      ],
      dependencies: {
        "@formatjs/fast-memoize": "^2.2.2",
        "@formatjs/icu-messageformat-parser": "^2.9.4",
        "@formatjs/intl": "2.10.8",
        "@gravity-ui/i18n-types": "workspace:*",
        "@typescript-eslint/parser": "8.14.1-alpha.6",
        "@typescript-eslint/typescript-estree": "^8.26.0",
        astring: "^1.9.0",
        cosmiconfig: "^9.0.0",
        "cosmiconfig-typescript-loader": "^6.1.0",
        esquery: "^1.6.0",
        "estree-toolkit": "^1.7.8",
        "format-message-parse": "^6.2.4",
        "format-message-print": "^6.2.4",
        "intl-messageformat": "10.7.0",
        picocolors: "^1.1.1"
      },
      devDependencies: {
        "@types/esquery": "1.5.4",
        "@types/estree": "^1.0.8",
        "@types/estree-jsx": "^1.0.5",
        "@types/jest": "^29.5.14",
        "@types/node": "^24.7.0",
        "@types/yargs": "^17.0.33",
        "@typescript-eslint/types": "^8.25.0",
        "@typescript-eslint/utils": "^8.25.0",
        eslint: "^9.15.0",
        "eslint-config": "workspace:*",
        jest: "29.7.0",
        prettier: "^3.4.2",
        "ts-jest": "29.1.1",
        tslib: "^2.8.1",
        tsup: "^8.0.1",
        typescript: "^5.6.3",
        yargs: "^16.2.0"
      },
      engines: {
        node: ">= 18"
      }
    };
  }
});

// src/cli/constants.ts
var pkg = require_package();
var bin = Object.keys(pkg.bin)[0];
var prettier;
var MODULE_NAME = "i18n-cli";
var log = (...mess) => console.log(`[${MODULE_NAME}]`, ...mess);
var TRANSLATIONS_FILE_POSTFIX = "i18n.ts";
function isMessageLikeMultilineICU(message) {
  return message.includes("\n  ") && message.includes("{") && message.includes("}");
}
function removeStartNewLineFromICU(message) {
  if (isMessageLikeMultilineICU(message)) {
    return message.trimStart();
  }
  return message;
}
var appRootPath = process.cwd();
var appRootExpression = new RegExp(`^${appRootPath}/`);
var toAbsolutePath = (path2) => resolve(appRootPath, toRelativePath(path2));
var toRelativePath = (path2) => path2.startsWith(appRootPath) ? path2.replace(appRootExpression, "") : path2;
var removeExtension = (path2) => {
  return path2.replace(/\.\w+$/, "");
};
var createRelativeImport = (fromPath, toPath, fromAlias) => {
  const toAbsPath = toAbsolutePath(toPath);
  const fromAbsPath = toAbsolutePath(fromPath);
  const parsedToAbsPath = parse(toPath);
  if (fromAlias && parse(toAbsPath).dir !== parse(fromAbsPath).dir) {
    return fromAlias;
  }
  let result = relative(parsedToAbsPath.ext ? parsedToAbsPath.dir : toAbsPath, fromAbsPath);
  if (!result.startsWith("../")) {
    result = `./${result}`;
  }
  return removeExtension(result);
};
var formatCode = async (code, outputFilePath) => {
  if (!prettier) {
    try {
      prettier = await import('prettier');
    } catch (_err) {
      prettier = void 0;
    }
  }
  if (prettier) {
    try {
      const prettierOptions = await prettier.resolveConfig(outputFilePath);
      if (prettierOptions) {
        const formattedCode = await prettier.format(code, prettierOptions);
        return prettier.format(formattedCode, prettierOptions);
      }
    } catch (_prettierError) {
    }
  }
  return code;
};
var DEFAULT_LOCALES = ["ru", "en"];
var DEFAULT_CLIENT_INTL_PATH = "src/ui/shared/i18n.ts";
var DEFAULT_SERVER_INTL_PATH = "src/server/utils/i18n.ts";
var DEFAULT_SERVER_PATH_MATCHERS = [/src\/server\/.+$/];
function normalizeProjectConfig(projectConfig) {
  const clientIntlModule = projectConfig?.clientIntlModule;
  const serverIntlModule = projectConfig?.serverIntlModule;
  return {
    ...projectConfig,
    allowedLocales: projectConfig?.allowedLocales || DEFAULT_LOCALES,
    clientIntlModule: {
      ...clientIntlModule,
      path: clientIntlModule?.path || DEFAULT_CLIENT_INTL_PATH
    },
    serverIntlModule: {
      ...serverIntlModule,
      path: serverIntlModule?.path || DEFAULT_SERVER_INTL_PATH,
      pathMatchers: serverIntlModule?.pathMatchers || DEFAULT_SERVER_PATH_MATCHERS
    }
  };
}
var DEFAULT_SEARCH_PLACES = ["i18n.config.ts", "i18n.config.js"];
var cachedProjectConfig;
var loadProjectConfig = (searchPlaces) => {
  if (cachedProjectConfig) {
    return cachedProjectConfig;
  }
  const explorer = cosmiconfigSync(MODULE_NAME, {
    cache: false,
    stopDir: searchPlaces ? void 0 : process.cwd(),
    searchPlaces: searchPlaces ?? DEFAULT_SEARCH_PLACES
  });
  const cfg = explorer.search();
  if (!cfg) {
    log("i18n config not found. Using default values");
  }
  const config = cfg?.config;
  cachedProjectConfig = normalizeProjectConfig(config);
  return cachedProjectConfig;
};

// src/constants.ts
var DEFAULT_EXPORT_ALIASES = {
  Message: "Message",
  t: "t"
};

// src/generateTranslationsFile.ts
function prettifyMultilineICU(message) {
  try {
    const ast = parseIcuMessage(message);
    return createPrettyIcuMessage(ast);
  } catch (err) {
    log(`Invalid ICU message "${message}"`, err);
    return message;
  }
}
function generateMessageLiteral(message) {
  if (message === void 0) {
    return builders.identifier("undefined");
  }
  if (message === null) {
    return builders.literal(null);
  }
  if (isMessageLikeMultilineICU(message)) {
    const prettyICU = "\n" + prettifyMultilineICU(message);
    return builders.templateLiteral(
      [builders.templateElement({ raw: prettyICU, cooked: prettyICU }, true)],
      []
    );
  }
  return builders.literal(message);
}
function generateLegacyPluralObject(value) {
  return builders.objectExpression(
    Object.entries(value).map(
      ([form, formValue]) => builders.property(
        "init",
        builders.identifier(form),
        generateMessageLiteral(formValue)
      )
    )
  );
}
function generateMeta(meta) {
  const properties = [];
  if (meta.id) {
    properties.push(builders.property("init", builders.identifier("id"), builders.literal(meta.id)));
  }
  if (meta.description) {
    properties.push(
      builders.property("init", builders.identifier("description"), builders.literal(meta.description))
    );
  }
  if (typeof meta.markdown === "boolean") {
    properties.push(builders.property("init", builders.identifier("markdown"), builders.literal(meta.markdown)));
  }
  return properties.length ? builders.objectExpression(properties) : void 0;
}
function generateMessageObject(message, allowedLocales) {
  const propsRecord = {};
  let metaProp;
  for (const [key, val] of Object.entries(message)) {
    let node = void 0;
    if (key === "meta") {
      const metaObj = generateMeta(val);
      if (metaObj) {
        metaProp = builders.property("init", builders.literal("meta"), metaObj);
      }
    } else if (isLegacyPlural(val)) {
      node = generateLegacyPluralObject(val);
    } else if (typeof val === "string" || val === null) {
      node = generateMessageLiteral(val);
    }
    if (node) {
      propsRecord[key] = builders.property("init", builders.literal(key), node);
    }
  }
  const sortedProps = allowedLocales.map(
    (locale) => propsRecord[locale] || builders.property("init", builders.literal(locale), builders.literal(null))
  );
  if (metaProp) {
    sortedProps.push(metaProp);
  }
  return builders.objectExpression(sortedProps);
}
function generateMessagesObject(messages, allowedLocales) {
  const sortedMessages = messages.slice().sort(
    (a, b2) => a.meta.objectKey.localeCompare(b2.meta.objectKey, "en", { sensitivity: "case" })
  );
  return builders.objectExpression(
    sortedMessages.map(
      ({ message, meta }) => builders.property(
        "init",
        builders.literal(meta.objectKey),
        generateMessageObject(message, allowedLocales)
      )
    )
  );
}
function determineIntlModule(outputPath, config) {
  return config.serverIntlModule.pathMatchers?.some((m) => m.test(outputPath)) ? config.serverIntlModule : config.clientIntlModule;
}
function generateTranslationsFileContent(params) {
  const config = loadProjectConfig();
  const intlModule = determineIntlModule(params.outputPath, config);
  const intlImportPath = createRelativeImport(
    intlModule.path,
    params.outputPath,
    intlModule.alias
  );
  const { exportAliases } = params;
  const tExportName = exportAliases?.t || DEFAULT_EXPORT_ALIASES.t;
  const messageExportName = exportAliases?.Message || DEFAULT_EXPORT_ALIASES.Message;
  const content = generate(
    builders.program(
      [
        builders.exportNamedDeclaration(
          builders.variableDeclaration("const", [
            builders.variableDeclarator(
              builders.objectPattern(
                intlModule === config.serverIntlModule ? [
                  builders.property(
                    "init",
                    builders.identifier("messages"),
                    builders.identifier("messages"),
                    false,
                    true
                  )
                ] : [
                  builders.property(
                    "init",
                    builders.identifier(DEFAULT_EXPORT_ALIASES.t),
                    builders.identifier(tExportName),
                    false,
                    tExportName === DEFAULT_EXPORT_ALIASES.t
                  ),
                  builders.property(
                    "init",
                    builders.identifier(DEFAULT_EXPORT_ALIASES.Message),
                    builders.identifier(messageExportName),
                    false,
                    messageExportName === DEFAULT_EXPORT_ALIASES.Message
                  )
                ]
              ),
              builders.callExpression(
                builders.memberExpression(
                  builders.identifier("intl"),
                  builders.identifier("createMessages")
                ),
                [generateMessagesObject(params.messages, config.allowedLocales)]
              )
            )
          ])
        )
      ],
      "module"
    )
  );
  return `import {intl} from "${intlImportPath}";

${content}`;
}
function generateOutputFilename(outputPath) {
  const absPath = toAbsolutePath(outputPath);
  const parsedPath = parse(absPath);
  if (absPath.endsWith(TRANSLATIONS_FILE_POSTFIX)) {
    return absPath;
  }
  return resolve(parsedPath.ext ? parsedPath.dir : absPath, TRANSLATIONS_FILE_POSTFIX);
}
async function generateTranslationsFile(params) {
  const translationsFilePath = generateOutputFilename(params.outputPath);
  const content = generateTranslationsFileContent(params);
  try {
    const prettyCode = await formatCode(content, translationsFilePath);
    await writeFile(translationsFilePath, prettyCode);
  } catch (err) {
    log(`Failed to generate translations file: ${translationsFilePath}`, err);
    throw err;
  }
}

// src/types.ts
var isTranslationFunction = (functionName) => {
  return functionName === "t" || functionName === "Message";
};

// src/parsing/createSourceVisitors.ts
var LOCAL_I18N_PATH = "./i18n";
var isLocalI18nImport = (importLine) => {
  return importLine === LOCAL_I18N_PATH;
};
var I18N_IMPORT_REG_EXP = /i18n$/;
var LOCAL_I18N_FUNCTION_REG_EXP = /^t$/;
var isLocalI18nFunctionCallee = (calleeName) => {
  return LOCAL_I18N_FUNCTION_REG_EXP.test(calleeName);
};
var LOCAL_I18N_COMPONENT_REG_EXP = /^Message$/;
var isLocalI18nComponentCallee = (calleeName) => {
  return LOCAL_I18N_COMPONENT_REG_EXP.test(calleeName);
};
var I18N_FUNCTION_REG_EXPS = [LOCAL_I18N_FUNCTION_REG_EXP, /[a-z]+T$/];
var I18N_COMPONENT_REG_EXPS = [
  // LOCAL_I18N_COMPONENT_REG_EXP - нет необходимости, т к это частный случай регулярки ниже
  /Message$/
];
var createSourceVisitors = ({
  onCallFound,
  onJsxCallFound,
  onImportFound,
  additionalFunctions,
  additionalComponents
}) => {
  const isI18nMethod = (methodName) => {
    const checkRegExp = (regExp) => regExp.test(methodName);
    return I18N_FUNCTION_REG_EXPS.some(checkRegExp) || additionalFunctions?.some(checkRegExp) || false;
  };
  const isI18nComponent = (componentName) => {
    const checkRegExp = (regExp) => regExp.test(componentName);
    return I18N_COMPONENT_REG_EXPS.some(checkRegExp) || additionalComponents?.some(checkRegExp) || false;
  };
  const res = {};
  if (onImportFound) {
    res.ImportDeclaration = (node) => {
      const importPath = node.source.value.toString();
      const isI18nImport = I18N_IMPORT_REG_EXP.test(importPath);
      if (!isI18nImport) return;
      const importedI18nCalleeList = [];
      node.specifiers.forEach((importSpecifier) => {
        if (importSpecifier.type !== "ImportSpecifier" || importSpecifier.imported.type !== "Identifier") {
          return;
        }
        const importedName = importSpecifier.imported.name;
        if (isI18nMethod(importedName) || isI18nComponent(importedName)) {
          importedI18nCalleeList.push(importSpecifier.imported);
        }
      });
      if (importedI18nCalleeList.length) {
        onImportFound({ node, importedI18nCalleeList, importPath });
      }
    };
  }
  if (onCallFound) {
    res.CallExpression = (node) => {
      const callee = node.callee;
      if (callee.type !== "Identifier") return;
      const functionName = callee.name;
      if (!isI18nMethod(functionName) || node.arguments.length === 0) return;
      const idNode = node.arguments[0];
      const id = idNode.type === "Literal" ? idNode.value?.toString() : void 0;
      onCallFound({ node, idNode, id, functionName });
    };
  }
  if (onJsxCallFound) {
    res.JSXOpeningElement = (node) => {
      const nameObj = node.name;
      if (nameObj.type !== "JSXIdentifier") return;
      const componentName = nameObj.name;
      if (!isI18nComponent(componentName)) return;
      const idAttr = node.attributes.find((attr) => {
        return attr.type === "JSXAttribute" && attr.name.name === "id";
      });
      if (!idAttr) return;
      const id = idAttr.value?.type === "Literal" && idAttr.value.value ? idAttr.value.value.toString() : void 0;
      onJsxCallFound({ node, idAttr, id, componentName });
    };
  }
  return res;
};

// src/parsing/createSourceVisitorsWithCollectKeys.ts
var createSourceVisitorsWithCollectKeys = (args) => {
  const i18nCallToIds = {};
  const i18nCallToImportPath = {};
  const i18nImportSet = /* @__PURE__ */ new Set();
  const i18nImportToCalls = {};
  const visitors = createSourceVisitors({
    ...args,
    onImportFound(params) {
      const { importedI18nCalleeList, importPath } = params;
      i18nImportSet.add(importPath);
      i18nImportToCalls[importPath] = i18nImportToCalls[importPath] || /* @__PURE__ */ new Set();
      importedI18nCalleeList.forEach((importedI18n) => {
        i18nCallToImportPath[importedI18n.name] = importPath;
        i18nImportToCalls[importPath]?.add(importedI18n.name);
      });
    },
    onCallFound(params) {
      const { id, functionName } = params;
      if (id) {
        i18nCallToIds[functionName] = i18nCallToIds[functionName] || /* @__PURE__ */ new Set();
        i18nCallToIds[functionName].add(id);
      }
    },
    onJsxCallFound(params) {
      const { id, componentName } = params;
      if (id) {
        i18nCallToIds[componentName] = i18nCallToIds[componentName] || /* @__PURE__ */ new Set();
        i18nCallToIds[componentName].add(id);
      }
    }
  });
  return {
    i18nCallToIds,
    i18nCallToImportPath,
    i18nImportSet,
    i18nImportToCalls,
    visitors
  };
};
async function parseToAst({ filename, content }) {
  return parseToAstSync({
    filename,
    content: content ?? await promises.readFile(filename, { encoding: "utf-8" })
  });
}
function parseToAstSync({ filename, content }) {
  return parse$1(content, {
    range: true,
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: filename.endsWith("x")
    }
  });
}
var parseTsFile = async (filePath) => {
  const { visitors, ...fileStats } = createSourceVisitorsWithCollectKeys();
  const i18nImportToIds = {};
  const { i18nCallToImportPath, i18nCallToIds } = fileStats;
  const ast = await parseToAst({ filename: filePath });
  simpleTraverse(ast, {
    visitors
  });
  Object.keys(i18nCallToIds).forEach((i18nCallee) => {
    const i18nCalleeIds = i18nCallToIds[i18nCallee];
    const i18nImport = i18nCallToImportPath[i18nCallee];
    if (i18nImport) {
      i18nImportToIds[i18nImport] = i18nImportToIds[i18nImport] || /* @__PURE__ */ new Set();
      i18nCalleeIds.forEach((id) => i18nImportToIds[i18nImport]?.add(id));
    }
  });
  return { ...fileStats, i18nImportToIds };
};

// src/parseTranslationsFile.ts
var stringifyObj = (obj) => JSON.stringify(obj, null, 4);
function isCreateMessagesCall(node) {
  return node.type === AST_NODE_TYPES.CallExpression && node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier" && node.callee.property.name === "createMessages";
}
function parseStringValue(node) {
  if (node.type === "Identifier") {
    return node.name;
  }
  if (node.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }
  throw new Error(
    `[${MODULE_NAME}] Node must be string, but get ${node.type} at ${stringifyObj(node.loc)}`
  );
}
function parseBooleanValue(node) {
  if (node.type === "Literal" && typeof node.value === "boolean") {
    return node.value;
  }
  throw new Error(
    `[${MODULE_NAME}] Node must be boolean, but get ${node.type} at ${stringifyObj(node.loc)}`
  );
}
function parseMessageMeta(node) {
  if (node.type !== "ObjectExpression") {
    throw new Error(
      `[${MODULE_NAME}] Message meta must be ObjectExpression, but get ${node.type} at ${node.loc}`
    );
  }
  const meta = {};
  node.properties.forEach((prop) => {
    if (prop.type !== "Property") {
      throw new Error(
        `[${MODULE_NAME}] Incorrect node type ${prop.type} at ${stringifyObj(prop.loc)}`
      );
    }
    const key = parseStringValue(prop.key);
    if (key === "id") {
      meta.id = parseStringValue(prop.value);
    } else if (key === "description") {
      meta.description = parseStringValue(prop.value);
    } else if (key === "markdown") {
      meta.markdown = parseBooleanValue(prop.value);
    } else if (key === "disableTypograf") {
      meta.disableTypograf = parseBooleanValue(prop.value);
    }
  });
  return meta;
}
function parseMessageValue(node, disallowNesting) {
  if (node.type === "Literal") {
    if (node.value === null) {
      return null;
    }
    return parseStringValue(node);
  }
  if (node.type === "Identifier" && node.name === "undefined") {
    return null;
  }
  if (node.type === "TemplateLiteral") {
    if (node.expressions.length || node.quasis.length > 1) {
      throw new Error(
        `[${MODULE_NAME}] Forbidden to use expressions in TemplateLiteral. ${stringifyObj(node.loc)}`
      );
    }
    return removeStartNewLineFromICU(node.quasis[0]?.value.raw || "");
  }
  if (!disallowNesting && node.type === "ObjectExpression") {
    const value = {
      one: void 0,
      few: void 0,
      many: void 0,
      zero: void 0,
      two: void 0,
      other: void 0
    };
    node.properties.forEach((prop) => {
      if (prop.type !== "Property") {
        throw new Error(
          `[${MODULE_NAME}] Incorrect node type ${prop.type} at ${stringifyObj(prop.loc)}`
        );
      }
      const key = parseStringValue(prop.key);
      if (Object.keys(value).includes(key)) {
        const pluralVal = parseMessageValue(prop.value, true);
        if (typeof pluralVal !== "string" && typeof pluralVal !== "undefined" && pluralVal !== null) {
          throw new Error();
        }
        value[key] = pluralVal || "";
      } else {
        throw new Error(
          `[${MODULE_NAME}] Incorrect plural form ${key} at ${stringifyObj(prop.loc)}`
        );
      }
    });
    return value;
  }
  throw new Error(
    `[${MODULE_NAME}] Incorrect translation value type ${node.type} at ${stringifyObj(node.loc)}`
  );
}
function parseMessage(node) {
  if (node.type !== "ObjectExpression") {
    throw new Error(
      `[${MODULE_NAME}] Message must be ObjectExpression, but get ${node.type} at ${stringifyObj(node.loc)}`
    );
  }
  const message = {};
  node.properties.forEach((prop) => {
    if (prop.type !== "Property") {
      throw new Error(
        `[${MODULE_NAME}] Incorrect node type ${prop.type} at ${stringifyObj(prop.loc)}`
      );
    }
    const key = parseStringValue(prop.key);
    if (key === "meta") {
      message.meta = parseMessageMeta(prop.value);
    } else {
      const value = parseMessageValue(prop.value);
      message[key] = value;
    }
  });
  const { pluralCount, normalCount } = Object.entries(message).reduce(
    (acc, [key, cur]) => {
      if (key === "meta") {
        return acc;
      }
      if (cur === null || cur === "") {
        return acc;
      }
      const isPlural = isLegacyPlural(cur);
      return {
        pluralCount: isPlural ? acc.pluralCount + 1 : acc.pluralCount,
        normalCount: !isPlural ? acc.normalCount + 1 : acc.normalCount
      };
    },
    { normalCount: 0, pluralCount: 0 }
  );
  if (pluralCount > 0 && normalCount > 0) {
    throw new Error(
      `[${MODULE_NAME}] All translations must be strictly in the same form. Problem with message: ${stringifyObj(message)}`
    );
  }
  return message;
}
function getMessagesFromObjectExpression(node) {
  const messages = [];
  node.properties.forEach((prop) => {
    if (prop.type !== "Property") {
      throw new Error(
        `[${MODULE_NAME}] Incorrect node type ${prop.type} at ${stringifyObj(prop.loc)}`
      );
    }
    const key = parseStringValue(prop.key);
    messages.push({
      message: parseMessage(prop.value),
      meta: {
        objectKey: key
      }
    });
  });
  return messages;
}
async function parseTranslationsFile(args) {
  let messages = [];
  const exportAliases = {};
  const ast = await parseToAst({
    filename: args.filePath,
    content: args.content
  });
  simpleTraverse(ast, {
    visitors: {
      VariableDeclarator: (node) => {
        if (node.type === AST_NODE_TYPES.VariableDeclarator && node.id.type === AST_NODE_TYPES.ObjectPattern && node.init && node.init.type === AST_NODE_TYPES.CallExpression && isCreateMessagesCall(node.init)) {
          node.id.properties.forEach((prop) => {
            if (prop.type === AST_NODE_TYPES.Property && prop.key.type === AST_NODE_TYPES.Identifier) {
              const originalName = prop.key.name;
              if (prop.computed === false && prop.value.type === AST_NODE_TYPES.Identifier && originalName !== prop.value.name && isTranslationFunction(originalName)) {
                exportAliases[originalName] = prop.value.name;
              }
            }
          });
        }
      },
      CallExpression: (node) => {
        if (node && node.type === AST_NODE_TYPES.CallExpression && isCreateMessagesCall(node)) {
          const arg = node.arguments[0];
          if (!arg || arg?.type !== "ObjectExpression") {
            throw new Error(
              `[${MODULE_NAME}] Incorrect argument type ${arg?.type} at ${stringifyObj(node.loc)}`
            );
          }
          messages = getMessagesFromObjectExpression(arg);
        }
      }
    }
  });
  return {
    filePath: args.filePath,
    messages,
    exportAliases
  };
}
var isI18nFile = (dirent) => {
  return dirent.isFile() && dirent.name === TRANSLATIONS_FILE_POSTFIX;
};
var isTsFile = (dirent) => {
  return dirent.isFile() && (dirent.name.endsWith(".ts") || dirent.name.endsWith(".tsx") || dirent.name.endsWith(".js") || dirent.name.endsWith(".jsx"));
};
var throughDirs = async (moveFrom, recursively, dirCallback) => {
  const direntList = await fs2.readdir(moveFrom, { withFileTypes: true });
  const getTsFiles = () => {
    return direntList.filter((dirent) => isI18nFile(dirent) === false && isTsFile(dirent));
  };
  const i18nFile = direntList.find((dirent) => isI18nFile(dirent));
  await dirCallback(i18nFile, getTsFiles);
  if (recursively === false) return;
  const pList = direntList.reduce((acc, dirent) => {
    const fullPath = path.resolve(moveFrom, dirent.name);
    if (dirent.isDirectory()) {
      acc.push(throughDirs(fullPath, true, dirCallback));
    }
    return acc;
  }, []);
  await Promise.all(pList);
};

// src/cli/utils.ts
function createCommand(fn) {
  return (ctx) => {
    const res = fn(ctx);
    return res;
  };
}

// src/cli/commands/create-keys.ts
var addImportLine = async (filePath, i18nCalleeUsed, i18nPath) => {
  const code = await readFile(filePath, "utf-8");
  const importLine = `import { ${i18nCalleeUsed.join(", ")} } from '${i18nPath}'`;
  await writeFile(filePath, `${importLine}
${code}`);
};
var getLocalI18nCallToIds = (i18nCallsUsed) => {
  const localI18nCallUsed = {};
  const localI18nFunctionCallee = Object.keys(i18nCallsUsed).find(isLocalI18nFunctionCallee);
  if (localI18nFunctionCallee && i18nCallsUsed[localI18nFunctionCallee]) {
    localI18nCallUsed[localI18nFunctionCallee] = i18nCallsUsed[localI18nFunctionCallee];
  }
  const localI18nComponentCallee = Object.keys(i18nCallsUsed).find(isLocalI18nComponentCallee);
  if (localI18nComponentCallee && i18nCallsUsed[localI18nComponentCallee]) {
    localI18nCallUsed[localI18nComponentCallee] = i18nCallsUsed[localI18nComponentCallee];
  }
  return localI18nCallUsed;
};
var generateDafaultMessages = (keyList, locales, fallbackLocales) => {
  const message = locales.reduce((acc, locale) => {
    acc[locale] = fallbackLocales?.[locale] ? null : "";
    return acc;
  }, {});
  return keyList.map((objectKey) => ({ message, meta: { objectKey } }));
};
var job = async (filePath, localesList, fallbackLocales) => {
  const { i18nCallToIds, i18nImportSet, i18nImportToIds } = await parseTsFile(filePath);
  if (Object.keys(i18nCallToIds).length === 0) {
    log(`there is no i18n calls in file ${filePath}`);
    return;
  }
  const normalizedI18nImportToIds = i18nImportToIds;
  const localI18nImport = [...i18nImportSet].find(isLocalI18nImport);
  if (localI18nImport === void 0) {
    const localI18nCallToIds = getLocalI18nCallToIds(i18nCallToIds);
    const i18nCalleeUsed = Object.keys(localI18nCallToIds);
    if (i18nCalleeUsed.length) {
      const localI18nIdsSet = /* @__PURE__ */ new Set();
      Object.values(localI18nCallToIds).forEach((idsSet) => {
        idsSet.forEach((id) => localI18nIdsSet.add(id));
      });
      normalizedI18nImportToIds[LOCAL_I18N_PATH] = localI18nIdsSet;
      log(`trying add i18n local import line to ${filePath}`);
      try {
        await addImportLine(filePath, i18nCalleeUsed, LOCAL_I18N_PATH);
        log(`import line for local i18n added to ${filePath}`);
      } catch (err) {
        log(err);
      }
    }
  }
  const getI18nSourcePath = (i18nImport) => {
    const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
    if (i18nImport.startsWith("./") || i18nImport.startsWith("../")) {
      return `${join(dirPath, i18nImport)}.ts`;
    }
    return void 0;
  };
  const pList = Object.keys(normalizedI18nImportToIds).map((i18nImport) => {
    const i18nImportIdsSet = normalizedI18nImportToIds[i18nImport];
    if (!i18nImportIdsSet) return;
    const i18nImportIds = [...i18nImportIdsSet];
    const i18nFilePath = getI18nSourcePath(i18nImport);
    if (!i18nFilePath) {
      return;
    }
    return createKeysJob(i18nFilePath, localesList, [...i18nImportIds], fallbackLocales);
  });
  await Promise.all(pList);
};
var createKeysJob = async (i18nPath, localesList, keyList, fallbackLocales) => {
  const translationsFile = await parseTranslationsFile({
    filePath: i18nPath
  }).catch(() => {
    log(`there is no i18n file ${i18nPath}`);
    return null;
  });
  if (translationsFile === null) {
    log(`trying create ${i18nPath}`);
    const messages = generateDafaultMessages(keyList, localesList, fallbackLocales);
    await generateTranslationsFile({
      outputPath: i18nPath,
      messages
    });
    log(`${i18nPath} created`);
  } else {
    const fileMessages = translationsFile?.messages || [];
    const fileExportAliases = translationsFile?.exportAliases || {};
    const alreadyCreatedKeySet = new Set(fileMessages.map(({ meta }) => meta.objectKey));
    const messages = generateDafaultMessages(
      keyList.filter((key) => !alreadyCreatedKeySet.has(key)),
      localesList,
      fallbackLocales
    );
    if (messages.length !== 0) {
      log(`trying modify ${i18nPath}`);
      await generateTranslationsFile({
        outputPath: i18nPath,
        messages: [...fileMessages, ...messages],
        exportAliases: fileExportAliases
      });
      log(`${i18nPath} modified`);
    }
  }
};
var runCreateKeys = async (argv, projectConfig) => {
  const FILE_PATH = argv.path;
  const localesList = argv.locales?.split(",") || projectConfig.allowedLocales;
  const FALLBACKS = projectConfig.fallbackLocales;
  const isFilePathDir = lstatSync(FILE_PATH).isDirectory();
  if (isFilePathDir) {
    const filePathList = readdirSync(FILE_PATH, { withFileTypes: true }).reduce(
      (acc, file) => {
        if (isI18nFile(file) === false && isTsFile(file)) {
          acc.push(`${FILE_PATH}/${file.name}`);
        }
        return acc;
      },
      []
    );
    await Promise.all(
      filePathList.map((filePath) => {
        return job(filePath, localesList, FALLBACKS);
      })
    );
  } else {
    await job(FILE_PATH, localesList, FALLBACKS);
  }
};
var createKeys = createCommand(
  ({ projectConfig }) => ({
    command: `${"create-keys" /* CreateKeys */} <path>`,
    description: `
\u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u0442 \u0432\u044B\u0437\u043E\u0432\u044B i18n-\u0444\u0443\u043D\u043A\u0446\u0438\u0439 \u0432 \u043F\u0435\u0440\u0435\u0434\u0430\u043D\u043D\u043E\u043C \u0444\u0430\u0439\u043B\u0435 \u0438\u043B\u0438 \u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u0438.
\u0414\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u0442 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435 \u043A\u043B\u044E\u0447\u0438 \u0432 \u0444\u0430\u0439\u043B \u0441 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0430\u043C\u0438 (i18n.ts).
\u0412 \u0441\u043B\u0443\u0447\u0430\u0435, \u0435\u0441\u043B\u0438 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 i18n \u043D\u0435 \u0438\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u044B, \u0431\u0443\u0434\u0435\u0442 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0430 \u0441\u0442\u0440\u043E\u043A\u0430 \u0438\u043C\u043F\u043E\u0440\u0442\u0430.
    `.trim(),
    options(yargs2) {
      yargs2.positional("path", {
        describe: "\u041F\u0443\u0442\u044C \u043A \u0444\u0430\u0439\u043B\u0443/\u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u0438",
        type: "string",
        array: false
      }).option("locales", {
        alias: "l",
        type: "string",
        describe: '\u041B\u043E\u043A\u0430\u043B\u0438, \u0434\u043B\u044F \u043A\u043E\u0442\u043E\u0440\u044B\u0445 \u043D\u0443\u0436\u043D\u043E \u0437\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u0442\u0435\u043A\u0441\u0442\u044B (\u0434\u043B\u044F \u043F\u0440\u0438\u043C\u0435\u0440\u0430 "ru,kz,en")'
      });
    },
    action(args) {
      return runCreateKeys(args, projectConfig);
    }
  })
);
var job2 = async (filePath) => {
  const { i18nImportSet, i18nImportToIds } = await parseTsFile(filePath);
  const localI18nImport = [...i18nImportSet].find(isLocalI18nImport);
  if (localI18nImport === void 0) {
    return;
  }
  const localI18nUsedIds = i18nImportToIds[localI18nImport];
  return localI18nUsedIds;
};
var runFindUnused = async (argv) => {
  const isFilePathDir = lstatSync(argv.path).isDirectory();
  const dirPath = isFilePathDir ? argv.path : argv.path.split("/").slice(0, -1).join("/");
  return throughDirs(dirPath, argv.recursively, async (i18nDirent, getTsFiles) => {
    if (i18nDirent === void 0) return;
    const localI18nFilePath = `${i18nDirent.parentPath}/${i18nDirent.name}`;
    const translationsFile = await parseTranslationsFile({
      filePath: localI18nFilePath
    });
    const translationsFileInfo = translationsFile.messages.reduce(
      (acc, mess) => {
        acc[mess.meta.objectKey] = { customerList: [], mess };
        return acc;
      },
      {}
    );
    if (Object.keys(translationsFileInfo).length === 0) return;
    const tsFileList = getTsFiles();
    const pList = tsFileList.map((tsFile) => {
      return job2(`${tsFile.parentPath}/${tsFile.name}`).then((localI18nUsedIds) => {
        localI18nUsedIds?.forEach((keyName) => {
          if (!translationsFileInfo[keyName]) return;
          translationsFileInfo[keyName].customerList.push(tsFile);
        });
      });
    });
    await Promise.all(pList);
    let hasUnusedKeys = false;
    Object.keys(translationsFileInfo).forEach((key) => {
      const keyInfo = translationsFileInfo[key];
      if (keyInfo === void 0 || keyInfo.customerList.length === 0) {
        hasUnusedKeys = true;
        log(`unused key: "${key}" from ${localI18nFilePath}`);
        if (argv.delete) {
          delete translationsFileInfo[key];
        }
      }
    });
    if (hasUnusedKeys && argv.delete) {
      const messages = Object.values(translationsFileInfo).map(({ mess }) => mess);
      await generateTranslationsFile({
        outputPath: localI18nFilePath,
        messages,
        exportAliases: translationsFile.exportAliases
      });
      log(`${localI18nFilePath} modified`);
    }
  });
};
var DESCRIPTION = `\u041D\u0430\u0445\u043E\u0434\u0438\u0442 \u043D\u0435\u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C\u044B\u0435 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0435 \u043A\u043B\u044E\u0447\u0438 i18n (shared \u0438 common i18n \u0444\u0430\u0439\u043B\u044B \u043F\u043E\u043A\u0430 \u043D\u0435 \u0431\u0435\u0440\u0443\u0442\u0441\u044F \u043F\u043E \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435) \u0432 \u043F\u0435\u0440\u0435\u0434\u0430\u043D\u043D\u043E\u0439 \u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u0438.
\u041F\u043E\u0437\u0432\u043E\u043B\u044F\u0435\u0442 \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u043D\u0435\u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C\u044B\u0435 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0435 \u043A\u043B\u044E\u0447\u0438 \u0438\u0437 \u043F\u0440\u043E\u0435\u043A\u0442\u0430.`;
var findUnused = createCommand(() => ({
  command: `${"find-unused" /* FindUnused */} [path]`,
  description: DESCRIPTION,
  options(yargs2) {
    yargs2.positional("path", {
      describe: "\u0414\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u044F, \u0432 \u043A\u043E\u0442\u043E\u0440\u043E\u0439 \u043D\u0443\u0436\u043D\u043E \u043F\u0440\u043E\u0432\u0435\u0441\u0442\u0438 \u0430\u043D\u0430\u043B\u0438\u0437 \u0432\u044B\u0437\u043E\u0432\u043E\u0432 \u043A\u043B\u044E\u0447\u0435\u0439 i18n",
      default: "src",
      type: "string",
      demandOption: false
    }).option("recursively", {
      alias: "r",
      describe: "\u0420\u0435\u043A\u0443\u0440\u0441\u0438\u0432\u043D\u043E\u0435 \u043F\u0440\u043E\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0435 \u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u0439",
      default: true,
      type: "boolean"
    }).option("delete", {
      alias: "d",
      default: false,
      type: "boolean",
      description: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043D\u0435\u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C\u044B\u0435 \u043A\u043B\u044E\u0447\u0438"
    });
  },
  action(args) {
    return runFindUnused(args);
  }
}));

// src/cli/run.ts
var run = async () => {
  const cwd = process.cwd();
  const argv = hideBin(process.argv);
  const { name, version } = pkg;
  const parsedArgs = await yargs.wrap(120).version(version).option("config", {
    alias: "c",
    type: "string",
    description: "\u041F\u0443\u0442\u044C \u043A \u0444\u0430\u0439\u043B\u0443 \u0441 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0435\u0439",
    requiresArg: false
  }).parse(argv, {}, () => {
  });
  const args = yargs(argv);
  const projectConfig = loadProjectConfig(parsedArgs.config ? [parsedArgs.config] : void 0);
  const ctx = { bin, cwd, name, projectConfig };
  const commands = [createKeys, findUnused];
  commands.forEach((cmd) => {
    const { command, description, options, action } = cmd(ctx);
    args.command(
      command,
      description,
      (yargs2) => {
        return options(yargs2.usage(`${bin} ${command} [options]`));
      },
      async (args2) => {
        try {
          await action(args2);
        } catch (error) {
          const { message, stack } = error;
          console.log("");
          console.error(red(stack || message));
          process.exit(1);
        }
      }
    );
  });
  if (!argv.length) {
    args.showHelp();
  }
  await args.parse();
};
if (__require.main === module) {
  run();
}

export { run };
