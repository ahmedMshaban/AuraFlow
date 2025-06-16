import { useRoutes } from 'react-router';

import { AuthProvider } from './shared/contexts/authContext';
import StoreProvider from './shared/services/StoreProvider';
import AuthenticatedStressMonitoring from './shared/components/AuthenticatedStressMonitoring';

import Login from './modules/login';
import Register from './modules/register';
import Home from './modules/home';
import './shared/adaptations/themes.css';

function App() {
  const routesArray = [
    {
      path: '*',
      element: <Login />,
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },
    {
      path: '/home',
      element: <Home />,
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
