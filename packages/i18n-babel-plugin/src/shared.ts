export function isMessageLikeMultilineICU(message: string) {
    return message.includes('\n  ') && message.includes('{') && message.includes('}');
}

export function minifyICUMessage(message: string) {
    if (isMessageLikeMultilineICU(message)) {
        return message
            .replace(/\s+/g, ' ') // Заменяем последовательности пробелов на одиночные пробелы
            .replace(/{\s+/g, '{') // Убираем пробелы после {
            .replace(/\s+}/g, '}') // Убираем пробелы перед }
            .trim(); // Убираем лишние пробелы в начале и конце строки
    }

    return message;
}

export function escapeHtmlTags(text: string) {
    return text.replace(/(<[^>]*>)/g, "'$1'");
}
