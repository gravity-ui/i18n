import {computeT} from '../../local.i18n';
import {t} from './i18n';

export const ImageOverviewPage = () => (
    <div>
        <h1>
            {computeT('images')}
            <span>{' -> '}</span>
            {t('overviewImagePageTitle')}
        </h1>
    </div>
);
