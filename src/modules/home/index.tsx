import { useNavigate } from 'react-router';
import { useState } from 'react';

import { useAuth } from '../../shared/contexts/authContext';
import { doSignOut } from '../../shared/auth/firebase/auth';
import StressMonitoringPanel from '../../shared/components/StressMonitoringPanel';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div>
      <h1>Stress Detection</h1>
      <button
        onClick={() => {
          doSignOut().then(() => {
            navigate('/login');
          });
        }}
      >
        Logout
      </button>

      <div>Hello {currentUser?.displayName || currentUser?.email}, you are now logged in.</div>

      {/* For testing and development purposes */}
      <div style={{ marginTop: '30px' }}>
        <h2>Stress Monitoring Development Panel</h2>
        <p>This panel is for development purposes only.</p>
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => setShowPanel(!showPanel)}
            style={{
              padding: '10px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {showPanel ? 'Hide' : 'Show'} Stress Monitoring Panel
          </button>
        </div>
      </div>

      {showPanel && <StressMonitoringPanel />}
    </div>
  );
};

export default Home;
