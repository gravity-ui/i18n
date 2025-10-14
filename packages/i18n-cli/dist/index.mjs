import { isLegacyPlural } from '@gravity-ui/i18n-types';
export { TECH_LOCALE } from '@gravity-ui/i18n-types';
import { resolve, parse, relative } from 'path';
import { exec } from 'child_process';
import { simpleTraverse } from '@typescript-eslint/typescript-estree';
import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { promises } from 'fs';
import { parse as parse$1 } from '@typescript-eslint/parser';
import { writeFile } from 'fs/promises';
import { builders } from 'estree-toolkit';
import { generate } from 'astring';
import parseIcuMessage from 'format-message-parse';
import createPrettyIcuMessage from 'format-message-print';
import { cosmiconfigSync } from 'cosmiconfig';
import { promisify } from 'util';

// src/parseTranslationsFile.ts

// src/types.ts
var isTranslationFunction = (functionName) => {
  return functionName === "t" || functionName === "Message";
};
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
var toAbsolutePath = (path) => resolve(appRootPath, toRelativePath(path));
var toRelativePath = (path) => path.startsWith(appRootPath) ? path.replace(appRootExpression, "") : path;
var removeExtension = (path) => {
  return path.replace(/\.\w+$/, "");
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

// src/parsing/createSourceVisitors.ts
var I18N_IMPORT_REG_EXP = /i18n$/;
var LOCAL_I18N_FUNCTION_REG_EXP = /^t$/;
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
var execAsync = promisify(exec);
var FIND_EXEC_BUFFER_SIZE = 1048576;
var DEFAULT_ROOT_PATHS = ["src"];
async function resolveTranslationFiles(rootPaths = DEFAULT_ROOT_PATHS) {
  const findTranslationFiles = async (rootPath) => {
    const { stdout } = await execAsync(
      `find ${rootPath} -type f -name "*${TRANSLATIONS_FILE_POSTFIX}" -exec grep -l "createMessages" {} +`,
      {
        cwd: appRootPath,
        maxBuffer: FIND_EXEC_BUFFER_SIZE
      }
    );
    return stdout.trim().split("\n").filter(Boolean).map(toAbsolutePath);
  };
  return (await Promise.all(rootPaths.map(findTranslationFiles))).flat();
}
async function parseProjectTranslations(rootPaths) {
  const files = await resolveTranslationFiles(rootPaths);
  const promises = files.map(
    (path) => parseTranslationsFile({
      filePath: path
    })
  );
  return Promise.all(promises);
}

// src/config/defineConfig.ts
function defineConfig(config) {
  return config;
}

export { createSourceVisitors, defineConfig, generateTranslationsFile, generateTranslationsFileContent, loadProjectConfig, parseProjectTranslations, parseTranslationsFile };
