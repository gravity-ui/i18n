import type {AllowedLocales} from '../i18n.config';

// Required only for type checking when using declareMessages without intl instance
declare module '@gravity-ui/i18n-types' {
    interface CustomTypeOptions {
        allowedLocales: AllowedLocales;
    }
}
