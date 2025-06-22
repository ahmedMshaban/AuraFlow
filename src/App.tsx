import { useRoutes } from 'react-router';

import { AuthProvider } from './shared/contexts/authContext';
import StoreProvider from './shared/services/StoreProvider';
import AuthenticatedStressMonitoring from './shared/components/AuthenticatedStressMonitoring';
import { RouteGuard, NotFound } from './shared/components';

import Login from './modules/login';
import Register from './modules/register';
import Home from './modules/home';
import './shared/adaptations/themes.css';
import './App.css';

function App() {
  const routesArray = [
    {
      path: '/',
      element: (
        <RouteGuard isPublicRoute>
          <Login />
        </RouteGuard>
      ),
    },
    {
      path: '/login',
      element: (
        <RouteGuard isPublicRoute>
          <Login />
        </RouteGuard>
      ),
    },
    {
      path: '/register',
      element: (
        <RouteGuard isPublicRoute>
          <Register />
        </RouteGuard>
      ),
    },
    {
      path: '/home',
      element: (
        <RouteGuard>
          <Home />
        </RouteGuard>
      ),
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ];

  const routesElement = useRoutes(routesArray);

  return (
    <StoreProvider>
      <AuthProvider>
        <main className="app">{routesElement}</main>
        <AuthenticatedStressMonitoring />
      </AuthProvider>
    </StoreProvider>
  );
}

export default App;
