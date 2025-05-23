import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDzhbKUJD6ZhVgbd9WkqCTfBK1phb3lKdg',
  authDomain: 'auraflow-b6a3d.firebaseapp.com',
  projectId: 'auraflow-b6a3d',
  storageBucket: 'auraflow-b6a3d.firebasestorage.app',
  messagingSenderId: '650243771659',
  appId: '1:650243771659:web:69873c80c8e88574ec660e',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
