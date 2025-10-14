import { RuntimeModule, RuntimeGlobals } from 'webpack';
class InitialChunksRuntimeModule extends RuntimeModule {
    constructor(languageVariableName) {
        super('i18n-initial-chunks');
        // stage необходим для вставки патча после оригинального RuntimeGlobals.onChunksLoaded
        this.stage = RuntimeModule.STAGE_ATTACH;
        this.languageVariableName = languageVariableName;
    }
    generate() {
        const { compilation } = this;
        const requiredChunkIdsByLocale = {};
        if (compilation?.chunkGroups) {
            for (const chunkGroup of compilation.chunkGroups) {
                if (chunkGroup.isInitial?.()) {
                    for (const chunk of chunkGroup.chunks || []) {
                        const match = chunk.name?.match(/i18n\.(.+)\.initial/);
                        if (match && chunk.id) {
                            const locale = match[1];
                            if (!requiredChunkIdsByLocale[locale]) {
                                requiredChunkIdsByLocale[locale] = new Set();
                            }
                            requiredChunkIdsByLocale[locale].add(chunk.id);
                        }
                    }
                }
            }
        }
        const requiredChunkIdsByLocaleObject = Object.entries(requiredChunkIdsByLocale).reduce((acc, [locale, val]) => ({
            ...acc,
            [locale]: [...val],
        }), {});
        return `
    var currentLanguage = ${this.languageVariableName};
    var localizedChunkIds = new Set();
    var requiredChunkIdsByLocale = ${JSON.stringify(requiredChunkIdsByLocaleObject)};
    Object.entries(requiredChunkIdsByLocale).forEach(function ([locale, chunkIds]) {
        localizedChunkIds = new Set([...localizedChunkIds, ...chunkIds]);
        requiredChunkIdsByLocale[locale] = new Set(chunkIds);
    });

    var originalOnChunksLoaded = ${RuntimeGlobals.onChunksLoaded};

    ${RuntimeGlobals.onChunksLoaded} = function(result, chunkIds, fn, priority) {
        var requiredLocaleChunkIds = requiredChunkIdsByLocale[currentLanguage];
        var requiredChunkIds = chunkIds;

        if (requiredChunkIds && Array.isArray(requiredChunkIds)) {
            requiredChunkIds = requiredChunkIds.filter(function (chunkId) {
                if (requiredLocaleChunkIds && requiredLocaleChunkIds.has(chunkId)) {
                    return true;
                }

                if (localizedChunkIds.has(chunkId)) {
                    return false;
                }

                return true;
            });
        }

        return originalOnChunksLoaded(result, requiredChunkIds, fn, priority);
    };
        `;
    }
}
class LanguageRuntimeModule extends RuntimeModule {
    constructor(languageVariableName) {
        super('i18n-runtime-patch');
        this.languageVariableName = languageVariableName;
    }
    generate() {
        return `
    var originalEnsureChunk = ${RuntimeGlobals.ensureChunk};

    ${RuntimeGlobals.ensureChunk} = function(chunkId) {
        var currentLanguage = ${this.languageVariableName};
        var chunkName = ${RuntimeGlobals.getChunkScriptFilename}(chunkId);

        if (typeof chunkName === 'string' && chunkName.includes('i18n.')) {
            // Имя чанка имеет формат i18n.en.chunkName
            var chunkNameParts = chunkName.split('.');
            var chunkLanguage;

            if (chunkNameParts.length > 2) {
                chunkLanguage = chunkNameParts[1];
            }

            if (chunkLanguage && chunkLanguage !== currentLanguage) {
                return Promise.resolve();
            }
        }

        return originalEnsureChunk(chunkId);
    };
        `;
    }
}
export class LanguageRuntimePlugin {
    constructor(languageVariableName) {
        this.languageVariableName = languageVariableName;
    }
    apply(compiler) {
        compiler.hooks.thisCompilation.tap('i18n-optimize-plugin', (compilation) => {
            compilation.hooks.runtimeRequirementInTree
                .for(RuntimeGlobals.ensureChunkHandlers)
                .tap('i18n-optimize-plugin', (chunk) => {
                compilation.addRuntimeModule(chunk, new LanguageRuntimeModule(this.languageVariableName));
            });
            compilation.hooks.runtimeRequirementInTree
                .for(RuntimeGlobals.onChunksLoaded)
                .tap('i18n-optimize-plugin', (chunk) => {
                compilation.addRuntimeModule(chunk, new InitialChunksRuntimeModule(this.languageVariableName));
            });
        });
    }
}
//# sourceMappingURL=runtime.js.map