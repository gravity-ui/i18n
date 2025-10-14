import {computeT} from '../../local.i18n';
import {t} from './i18n';

export const CreateImagePage = () => (
    <div>
        <h1>
            {computeT('images')}
            <span>{' -> '}</span>
            {t('createImagePageTitle')}
        </h1>
    </div>
);
