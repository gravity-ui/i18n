/* eslint camelcase: ['error', {allow: ['__webpack_require__']}] */

import {Logger} from "./types";

declare let __webpack_require__: unknown;

declare global {
    interface Window {
        Ya?: {
            Rum?: {
                logError: (arg?: any) => void;
                ERROR_LEVEL: {
                    INFO: string;
                };
            };
        };
    }
}

const warnCache = new Set();

/**
 * @deprecated
 */
export const rumLogger: Logger = {
    log(message, {level, logger, extra} = {}) {
        if (typeof __webpack_require__ !== 'undefined' && process.env.NODE_ENV === 'development') {
            console.log('@yandex-cloud/i18n: default logger is deprecated, and would be removed in future. Consult docs for alternative.');
        }

        if (typeof window === 'undefined' || typeof window.Ya?.Rum?.logError !== 'function') {
            return;
        }

        if (warnCache.has(logger)) {
            return;
        }

        console.warn(`[${extra?.type}][${logger || ''}] ${message}`);

        try {
            window.Ya.Rum.logError({
                message,
                type: extra?.type,
                level: level === 'info' ? window.Ya.Rum.ERROR_LEVEL.INFO : undefined,
                block: logger
            });
        } catch (err) {
            console.error(err);
        }

        warnCache.add(logger);
    }
};
