import { FiMail, FiUser } from 'react-icons/fi';
import { Box, Button, VStack, HStack, Text, Heading } from '@chakra-ui/react';

import type { EmailAuthenticationProps } from '../../infrastructure/types/emails.types';

/**
 * A Gmail authentication component that provides stress-aware onboarding for email integration.
 * Displays connection interface with privacy information, stress-adaptive messaging,
 * and secure OAuth flow initiation for Gmail API access.
 *
 * Features:
 * - Stress-adaptive visual design and messaging
 * - Clear privacy and security information
 * - Loading states during authentication process
 * - Error handling with user-friendly messages
 * - Responsive design with accessible controls
 * - OAuth flow initiation for Gmail API
 *
 * Stress-Adaptive Behavior:
 * - When stressed: Adds stress detection notice and emphasizes email help
 * - Visual styling adapts (red.50 background vs gray.50)
 * - Messaging emphasizes stress reduction benefits
 * - Provides context for why email connection helps during stress
 *
 * Privacy & Security:
 * - Clearly communicates read-only access
 * - Emphasizes no data storage on servers
 * - Provides easy disconnection option
 * - Uses secure OAuth authentication flow
 *
 * @param props - The component props
 * @param props.isCurrentlyStressed - Current user stress state for adaptive behavior
 * @param props.authenticate - Callback to initiate Gmail OAuth authentication
 * @param props.isLoading - Loading state during authentication process
 * @param props.error - Error message if authentication fails
 * @returns A Gmail authentication interface with stress-aware features
 *
 * @example
 * ```tsx
 * const { isCurrentlyStressed } = useStressAnalytics();
 * const { authenticate, isLoading, error } = useGmail();
 *
 * <EmailAuthentication
 *   isCurrentlyStressed={isCurrentlyStressed}
 *   authenticate={authenticate}
 *   isLoading={isLoading}
 *   error={error}
 * />
 * ```
 *
 * @note Component adapts its appearance and messaging based on stress level
 * @note Uses secure OAuth flow for Gmail API authentication
 * @see {@link EmailAuthenticationProps} For detailed prop interface
 * @see {@link useGmail} For Gmail integration functionality
 */
const EmailAuthentication = ({ isCurrentlyStressed, authenticate, isLoading, error }: EmailAuthenticationProps) => {
  return (
    <Box
      p={5}
      textAlign="center"
      bg={isCurrentlyStressed ? 'red.50' : 'gray.50'}
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
    >
      <VStack gap={4}>
        <FiMail
          size={48}
          color="#6c757d"
        />
        <Heading
          size="md"
          color="gray.800"
        >
          Connect Your Gmail
        </Heading>
        <Text
          color="gray.600"
          maxW="400px"
          lineHeight="1.5"
        >
          Connect your Gmail account to view your latest emails with intelligent stress analysis. We'll help you
          prioritize what's important and suggest when to take breaks.
        </Text>
        {isCurrentlyStressed && (
          <Box
            p={3}
            bg="yellow.100"
            border="1px solid"
            borderColor="yellow.300"
            borderRadius="md"
            fontSize="sm"
            color="yellow.800"
          >
            😰{' '}
            <Text
              as="span"
              fontWeight="bold"
            >
              Stress detected!
            </Text>{' '}
            Connecting your email can help us provide better recommendations.
          </Box>
        )}{' '}
        <Button
          onClick={authenticate}
          size="lg"
          colorPalette="blue"
          loading={isLoading}
          loadingText="Connecting..."
        >
          <HStack>
            <FiUser />
            <Text>Connect Gmail Account</Text>
          </HStack>
        </Button>
        {error && (
          <Box
            p={3}
            bg="red.100"
            border="1px solid"
            borderColor="red.300"
            borderRadius="md"
            fontSize="sm"
            color="red.800"
          >
            ⚠️ {error}
          </Box>
        )}
        <Box
          mt={4}
          fontSize="xs"
          color="gray.500"
        >
          <Text fontWeight="bold">🔒 Privacy & Security:</Text>
          <VStack
            gap={1}
            mt={2}
          >
            <Text>✅ Read-only access to your emails</Text>
            <Text>✅ No data stored on our servers</Text>
            <Text>✅ Disconnect anytime</Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default EmailAuthentication;
