import { useState } from 'react';
import { Navigate, Link } from 'react-router';

import { useAuth } from '../../shared/hooks/useAuth';
import { doCreateUserWithEmailAndPassword } from '../../shared/auth/firebase/auth';
import type { AuthContextType } from '@/shared/types/authContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage] = useState('');

  const { userLoggedIn } = useAuth() as AuthContextType;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isRegistering) {
      setIsRegistering(true);
      await doCreateUserWithEmailAndPassword(email, password);
    }
  };

  return (
    <>
      {userLoggedIn && (
        <Navigate
          to={'/home'}
          replace={true}
        />
      )}

      <main>
        <div>
          <div>
            <div>
              <h3>Create a New Account</h3>
            </div>
          </div>
          <form onSubmit={onSubmit}>
            <div>
              <label>Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>

            <div>
              <label>Password</label>
              <input
                disabled={isRegistering}
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>

            <div>
              <label>Confirm Password</label>
              <input
                disabled={isRegistering}
                type="password"
                autoComplete="off"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setconfirmPassword(e.target.value);
                }}
              />
            </div>

            {errorMessage && <span>{errorMessage}</span>}

            <button
              type="submit"
              disabled={isRegistering}
            >
              {isRegistering ? 'Signing Up...' : 'Sign Up'}
            </button>
            <div>
              Already have an account? {'   '}
              <Link to={'/login'}>Continue</Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default Register;
