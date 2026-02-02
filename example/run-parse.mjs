import {parseTranslationsFile, generateTranslationsFileContent} from '@gravity-ui/i18n-cli';

// Test parsing standalone declareMessages
const result = await parseTranslationsFile({
    filePath: 'src/shared/reuse-messages/other.i18n.ts',
});

console.log('=== Parse Result ===');
console.log('declarationType:', result.declarationType);
console.log('exportAliases:', result.exportAliases);
console.log('messages:', JSON.stringify(result.messages, null, 2));

// Test generating standalone declareMessages
console.log('\n=== Generated Content ===');
const generated = generateTranslationsFileContent({
    outputPath: 'src/shared/reuse-messages/other.i18n.ts',
    messages: result.messages,
    declarationType: result.declarationType,
    exportAliases: result.exportAliases,
});
console.log(generated);
