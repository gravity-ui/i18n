import type {AllowedLocales} from '../i18n.config';

declare module '@gravity-ui/i18n-types' {
    interface CustomTypeOptions {
        allowedLocales: AllowedLocales;
    }
}
