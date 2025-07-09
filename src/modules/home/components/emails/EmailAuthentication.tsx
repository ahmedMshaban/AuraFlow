import { FiMail, FiUser } from 'react-icons/fi';
import { Box, Button, VStack, HStack, Text, Heading } from '@chakra-ui/react';

import type { EmailAuthenticationProps } from '../../infrastructure/types/emails.types';

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
