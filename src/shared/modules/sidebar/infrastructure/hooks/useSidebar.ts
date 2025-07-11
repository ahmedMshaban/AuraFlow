import { useState } from 'react';
import { useNavigate } from 'react-router';
import { doSignOut } from '@/shared/auth/firebase/auth';

/**
 * Custom hook for managing sidebar state and navigation functionality.
 * Provides sidebar toggle controls and secure user sign-out capabilities.
 * Handles navigation flow and authentication state management.
 *
 * Sidebar Features:
 * - Toggle sidebar open/closed state
 * - Persistent sidebar state during session
 * - Clean state management for UI responsiveness
 *
 * Authentication Integration:
 * - Secure Firebase sign-out functionality
 * - Automatic navigation to login page after sign-out
 * - Error handling for sign-out failures
 * - Clean authentication state cleanup
 *
 * Navigation Flow:
 * - Post-logout redirection to login page
 * - Seamless integration with React Router
 * - Proper route handling after authentication changes
 *
 * @returns Object containing sidebar state and control functions
 *
 * @example
 * ```tsx
 * function SidebarComponent() {
 *   const { isSidebarOpen, toggleSidebar, handleSignOut } = useSidebar();
 *
 *   return (
 *     <div>
 *       <Button onClick={toggleSidebar}>
 *         {isSidebarOpen ? 'Close' : 'Open'} Sidebar
 *       </Button>
 *
 *       <Sidebar isOpen={isSidebarOpen}>
 *         <Navigation />
 *         <Button onClick={handleSignOut} variant="ghost">
 *           Sign Out
 *         </Button>
 *       </Sidebar>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Mobile responsive sidebar
 * function MobileLayout() {
 *   const { isSidebarOpen, toggleSidebar } = useSidebar();
 *
 *   return (
 *     <>
 *       <Header>
 *         <IconButton
 *           icon={<MenuIcon />}
 *           onClick={toggleSidebar}
 *           display={{ base: 'block', md: 'none' }}
 *         />
 *       </Header>
 *
 *       <Drawer isOpen={isSidebarOpen} onClose={toggleSidebar}>
 *         <SidebarContent />
 *       </Drawer>
 *     </>
 *   );
 * }
 * ```
 *
 * @note Sign-out errors are logged to console for debugging
 * @see {@link doSignOut} for Firebase authentication sign-out
 * @see {@link useNavigate} for React Router navigation
 */
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
