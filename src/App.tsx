import { useRoutes } from 'react-router';

import { AuthProvider } from './shared/contexts/authContext';

import Login from './modules/login';
import Register from './modules/register';
import Home from './modules/home';
import './App.css';

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
    <AuthProvider>
      <div className="app">{routesElement}</div>
    </AuthProvider>
  );
}

export default App;
