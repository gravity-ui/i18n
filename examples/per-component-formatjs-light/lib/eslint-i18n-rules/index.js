const autoGenerateTranslationMessageId = require('./rules/auto-generate-translation-message-id/rule');

module.exports = {
    rules: {
//      'need-i18n-import': '',
        'out-of-sync-i18n-keys': require('./rules/out-of-sync-i18n-keys').outOfSyncI18nKeys,
        'auto-generate-translation-message-id': autoGenerateTranslationMessageId,
    },
};
