import { useNavigate } from 'react-router';

import FaceAnalysis from '../../shared/modules/stress-detector/FaceAnalysis';
import { useAuth } from '../../shared/contexts/authContext';
import { doSignOut } from '../../shared/auth/firebase/auth';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div>
      <h1>Stress Detection</h1>
      <button
        onClick={() => {
          doSignOut().then(() => {
            navigate('/login');
          });
        }}
        className="text-sm text-blue-600 underline"
      >
        Logout
      </button>

      <div className="text-2xl font-bold pt-14">
        Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.
      </div>

      <FaceAnalysis />
    </div>
  );
};

export default Home;
