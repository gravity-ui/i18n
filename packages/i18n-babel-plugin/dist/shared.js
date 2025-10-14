"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMessageLikeMultilineICU = isMessageLikeMultilineICU;
exports.minifyICUMessage = minifyICUMessage;
exports.escapeHtmlTags = escapeHtmlTags;
function isMessageLikeMultilineICU(message) {
    return message.includes('\n  ') && message.includes('{') && message.includes('}');
}
function minifyICUMessage(message) {
    if (isMessageLikeMultilineICU(message)) {
        return message
            .replace(/\s+/g, ' ') // Заменяем последовательности пробелов на одиночные пробелы
            .replace(/{\s+/g, '{') // Убираем пробелы после {
            .replace(/\s+}/g, '}') // Убираем пробелы перед }
            .trim(); // Убираем лишние пробелы в начале и конце строки
    }
    return message;
}
function escapeHtmlTags(text) {
    return text.replace(/(<[^>]*>)/g, "'$1'");
}
//# sourceMappingURL=shared.js.map