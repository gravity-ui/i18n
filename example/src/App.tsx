import './App.css';
import {MainPage} from './pages';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Link,
    Outlet,
    Route,
    RouterProvider,
} from 'react-router-dom';
import {intl, setLocale} from '@shared/i18n';
import {CreateImagePage} from './units/compute/pages/CreateImagePage';
import {ImageOverviewPage} from './units/compute/pages/ImageOverviewPage';

const Layout = () => {
    return (
        <div>
            <div style={{width: '100%', fontSize: '20px', marginBottom: '30px'}}>
                <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
                    {[...intl.allowedLocales, 'ru-unknown', 'unknown'].map((locale) => {
                        return (
                            <button
                                key={locale}
                                style={{
                                    border:
                                        intl.getLocale() === locale ? '1px solid white' : undefined,
                                }}
                                onClick={() => setLocale(locale)}
                            >
                                {locale}
                            </button>
                        );
                    })}
                </div>
                <div style={{marginTop: 20}}>Current locale: {intl.getLocale()}</div>
                <div>Current fallback locales: {intl.getCurrentFallbackLocales().join(', ')}</div>
                <div>Number format: {intl.formatNumber(123456.789)}</div>
                <hr />
                <div
                    style={{
                        display: 'flex',
                        gap: '24px',
                        justifyContent: 'center',
                    }}
                >
                    <div>
                        <Link to="/">Главная</Link>
                    </div>
                    <div>
                        <Link to="/compute/create-image">Создать образ</Link>
                    </div>
                    <div>
                        <Link to="/compute/some-id/overview">Просмотр образа</Link>
                    </div>
                </div>
                <hr />
            </div>
            <Outlet />
        </div>
    );
};

const routes = createRoutesFromElements([
    <Route key="layout" element={<Layout />}>
        <Route element={<MainPage />} index />
        <Route element={<CreateImagePage />} path="/compute/create-image" />
        <Route element={<ImageOverviewPage />} path="/compute/some-id/overview" />
    </Route>,
]);

const router = createBrowserRouter(routes);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
