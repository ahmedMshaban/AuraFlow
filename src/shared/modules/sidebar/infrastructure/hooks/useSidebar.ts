import { useState } from 'react';
import { useNavigate } from 'react-router';
import { doSignOut } from '@/shared/auth/firebase/auth';

const useSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    try {
      await doSignOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return { isSidebarOpen, toggleSidebar, handleSignOut };
};

export default useSidebar;
