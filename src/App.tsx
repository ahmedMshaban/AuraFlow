import { useRoutes } from 'react-router';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './shared/contexts/authContext';
import StoreProvider from './shared/services/StoreProvider';
import AuthenticatedStressMonitoring from './shared/components/AuthenticatedStressMonitoring';
import { RouteGuard, NotFound } from './shared/components';

import Login from './modules/login';
import Register from './modules/register';
import Home from './modules/home';
import Activities from './modules/activities';
import TasksPage from './modules/tasks';
import EmailsPage from './modules/emails';
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
      path: '/activities',
      element: (
        <RouteGuard>
          <Activities />
        </RouteGuard>
      ),
    },
    {
      path: '/tasks',
      element: (
        <RouteGuard>
          <TasksPage />
        </RouteGuard>
      ),
    },
    {
      path: '/emails',
      element: (
        <RouteGuard>
          <EmailsPage />
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
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '100px',
              background: '#fff',
              color: '#333',
            },
          }}
        />
      </AuthProvider>
    </StoreProvider>
  );
}

export default App;
