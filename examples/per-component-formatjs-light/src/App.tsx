import './App.css'
import { RawIntlProvider } from 'react-intl'
import { intl } from './shared/i18n'
import { MainPage, AboutPage } from './pages'
import { createBrowserRouter, createRoutesFromElements, Link, Outlet, Route, RouterProvider } from 'react-router-dom'

const Layout = () => (
    <div>
        <div style={{display: 'flex', gap: '16px', width: '100%', 'position': 'absolute', left: 0, top: 0, justifyContent: 'center', fontSize: '20px'}}>
            <Link to="/">Главная</Link>
            <Link to="/about">О нас</Link>
        </div>
        <Outlet />
    </div>
)

const routes = createRoutesFromElements([
    <Route element={<Layout />}>
        <Route element={<MainPage />} index />
        <Route element={<AboutPage />} path='/about' />
    </Route>
])

const router = createBrowserRouter(routes);

function App() {
  return (
    <RawIntlProvider value={intl}>
        <RouterProvider router={router} />
    </RawIntlProvider>
  )
}

export default App
