import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import Register from './index';
import { useAuth } from '../../shared/hooks/useAuth';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';

// Mock useAuth hook
vi.mock('../../shared/hooks/useAuth');

// Mock react-router
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace: boolean }) => (
      <div
        data-testid="navigate"
        data-to={to}
        data-replace={replace}
      >
        Navigate to {to}
      </div>
    ),
    Link: ({ to, children, ...props }: { to: string; children: ReactNode; [key: string]: unknown }) => (
      <a
        href={to}
        data-testid="link"
        {...props}
      >
        {children}
      </a>
    ),
  };
});

// Mock RegisterForm component
vi.mock('./components/RegisterForm', () => ({
  default: () => <div data-testid="register-form">Register Form</div>,
}));

// Mock Button component
vi.mock('@/shared/theme/button/Button', () => ({
  Button: ({
    children,
    asChild,
    variant,
    ...props
  }: {
    children: ReactNode;
    asChild?: boolean;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <div
      data-testid="button"
      data-as-child={asChild}
      data-variant={variant}
      {...props}
    >
      {children}
    </div>
  ),
}));

// Mock images
vi.mock('../../assets/images/auraFlow-normal-colors.png', () => ({
  default: 'mock-logo.png',
}));

vi.mock('../../assets/images/23548095_Male animator sitting at computer desk and creating project.svg', () => ({
  default: 'mock-banner.svg',
}));

const mockUseAuth = vi.mocked(useAuth);

// Test wrapper component
const TestWrapper = ({ children }: { children: ReactNode }) => <BrowserRouter>{children}</BrowserRouter>;

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });
  describe('when user is not logged in', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        userLoggedIn: false,
        isEmailUser: false,
        isGoogleUser: false,
        currentUser: null,
        setCurrentUser: vi.fn(),
        loading: false,
      });
    });

    it('renders the register page correctly', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      // Check for main elements
      expect(screen.getByAltText('AuraFlow logo')).toBeDefined();
      expect(screen.getByText('Already have an account?')).toBeDefined();
      expect(screen.getByText('Sign in')).toBeDefined();
      expect(screen.getByText('Get more done')).toBeDefined();
      expect(screen.getByText('Boost your productivity and efficiency')).toBeDefined();
      expect(screen.getByText('Get started for FREE')).toBeDefined();
      expect(screen.getByTestId('register-form')).toBeDefined();
    });

    it('renders the header with logo and login link', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      const logo = screen.getByAltText('AuraFlow logo');
      expect(logo).toBeDefined();
      expect(logo.getAttribute('src')).toBe('mock-logo.png');

      const signInLink = screen.getByTestId('link');
      expect(signInLink).toBeDefined();
      expect(signInLink.getAttribute('href')).toBe('/login');
      expect(screen.getByText('Sign in')).toBeDefined();
    });

    it('renders the banner section with image and description', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      const bannerImage = screen.getByAltText('AuraFlow banner');
      expect(bannerImage).toBeDefined();
      expect(bannerImage.getAttribute('src')).toBe('mock-banner.svg');

      expect(screen.getByText('Get more done')).toBeDefined();
      expect(screen.getByText('Boost your productivity and efficiency')).toBeDefined();

      const imageCredit = screen.getByText('Image by pch.vector on Freepik');
      expect(imageCredit).toBeDefined();
      expect(imageCredit.tagName.toLowerCase()).toBe('a');
    });

    it('renders the register form section', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      expect(screen.getByText('Get started for FREE')).toBeDefined();
      expect(screen.getByTestId('register-form')).toBeDefined();
    });

    it('does not render Navigate component when user is not logged in', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      expect(screen.queryByTestId('navigate')).toBe(null);
    });

    it('renders Button component with correct props', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      const button = screen.getByTestId('button');
      expect(button).toBeDefined();
      expect(button.getAttribute('data-as-child')).toBe('true');
      // The Button component doesn't have a variant prop in the Register component, so it should be null
      expect(button.getAttribute('data-variant')).toBeNull();
    });

    it('has proper image credit link attributes', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      const creditLink = screen.getByText('Image by pch.vector on Freepik');
      expect(creditLink.getAttribute('href')).toContain('freepik.com');
    });
  });
  describe('when user is logged in', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        userLoggedIn: true,
        isEmailUser: true,
        isGoogleUser: false,
        currentUser: { uid: '123', email: 'test@example.com' } as unknown as User,
        setCurrentUser: vi.fn(),
        loading: false,
      });
    });

    it('renders Navigate component to redirect to home', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      const navigate = screen.getByTestId('navigate');
      expect(navigate).toBeDefined();
      expect(navigate.getAttribute('data-to')).toBe('/home');
      expect(navigate.getAttribute('data-replace')).toBe('true');
    });

    it('still renders the main content even when redirecting', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      // The component should still render its content even with the Navigate component
      expect(screen.getByAltText('AuraFlow logo')).toBeDefined();
      expect(screen.getByText('Get started for FREE')).toBeDefined();
      expect(screen.getByTestId('register-form')).toBeDefined();
    });
  });
  describe('accessibility', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        userLoggedIn: false,
        isEmailUser: false,
        isGoogleUser: false,
        currentUser: null,
        setCurrentUser: vi.fn(),
        loading: false,
      });
    });

    it('has proper alt text for images', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      const logo = screen.getByAltText('AuraFlow logo');
      const banner = screen.getByAltText('AuraFlow banner');

      expect(logo).toBeDefined();
      expect(banner).toBeDefined();
    });

    it('has proper heading structure', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });

      expect(h1.textContent).toBe('Get started for FREE');
      expect(h2.textContent).toBe('Get more done');
    });

    it('has properly linked elements', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      const loginLink = screen.getByTestId('link');
      const creditLink = screen.getByText('Image by pch.vector on Freepik');

      expect(loginLink.getAttribute('href')).toBe('/login');
      expect(creditLink.getAttribute('href')).toContain('freepik.com');
    });
  });
  describe('integration with useAuth hook', () => {
    it('calls useAuth hook', () => {
      mockUseAuth.mockReturnValue({
        userLoggedIn: false,
        isEmailUser: false,
        isGoogleUser: false,
        currentUser: null,
        setCurrentUser: vi.fn(),
        loading: false,
      });

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      expect(mockUseAuth).toHaveBeenCalled();
    });

    it('responds to different auth states', () => {
      // Test not logged in
      mockUseAuth.mockReturnValue({
        userLoggedIn: false,
        isEmailUser: false,
        isGoogleUser: false,
        currentUser: null,
        setCurrentUser: vi.fn(),
        loading: false,
      });

      const { rerender } = render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      expect(screen.queryByTestId('navigate')).toBe(null);

      // Test logged in
      mockUseAuth.mockReturnValue({
        userLoggedIn: true,
        isEmailUser: true,
        isGoogleUser: false,
        currentUser: { uid: '123', email: 'test@example.com' } as unknown as User,
        setCurrentUser: vi.fn(),
        loading: false,
      });

      rerender(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      expect(screen.getByTestId('navigate')).toBeDefined();
    });
  });

  describe('component structure', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        userLoggedIn: false,
        isEmailUser: false,
        isGoogleUser: false,
        currentUser: null,
        setCurrentUser: vi.fn(),
        loading: false,
      });
    });

    it('has proper CSS classes applied', () => {
      const { container } = render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      // Check if main container exists
      const registerContainer = container.querySelector('[class*="registerContainer"]');
      expect(registerContainer).toBeDefined();
    });

    it('renders all required sections', () => {
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>,
      );

      // Header section
      expect(screen.getByAltText('AuraFlow logo')).toBeDefined();
      expect(screen.getByText('Already have an account?')).toBeDefined();

      // Main content sections
      expect(screen.getByAltText('AuraFlow banner')).toBeDefined();
      expect(screen.getByText('Get more done')).toBeDefined();
      expect(screen.getByTestId('register-form')).toBeDefined();
    });
  });
});
