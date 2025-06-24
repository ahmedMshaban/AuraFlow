import { useEffect, useState } from 'react';
import { FiMail, FiAlertTriangle } from 'react-icons/fi';
import { Box, Button, VStack, HStack, Text, Heading, Badge, Spinner } from '@chakra-ui/react';

import { useStressAnalytics } from '@/shared/hooks/useStressAnalytics';
import type { EmailsProps } from '../../infrastructure/types/emails.types';

import EmailItem from './EmailItem';
import EmailAuthentication from './EmailAuthentication';

const Emails = ({
  maxEmails = 5,
  isAuthenticated,
  isLoading,
  error,
  profile,
  isLoadingEmails,
  emailsError,
  focusedEmails,
  otherEmails,
  authenticate,
  signOut,
  fetchEmailsByPriority,
}: EmailsProps) => {
  const [activeTab, setActiveTab] = useState<'focused' | 'others'>('focused');

  const { isCurrentlyStressed } = useStressAnalytics();

  // This will fetch maxEmails number of focused (high/medium priority)
  // and maxEmails number of other (low priority) emails
  useEffect(() => {
    if (isAuthenticated) {
      fetchEmailsByPriority(maxEmails, maxEmails);
    }
  }, [isAuthenticated, fetchEmailsByPriority, maxEmails]);

  // If user is stressed, show only focused tab
  const shouldShowFocusedOnly = isCurrentlyStressed;

  // Show loading state
  if (isLoading) {
    return (
      <VStack
        gap={4}
        align="center"
        p={8}
      >
        <Spinner
          size="lg"
          color="blue.500"
        />
        <Text>Initializing Gmail integration...</Text>
      </VStack>
    );
  }

  // Show authentication required
  if (!isAuthenticated) {
    return (
      <EmailAuthentication
        authenticate={authenticate}
        isLoading={isLoading}
        error={error}
        isCurrentlyStressed={isCurrentlyStressed}
      />
    );
  }

  return (
    <Box>
      {/* Header with profile info and disconnect option */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={5}
        p={4}
        bg={'green.50'}
        borderRadius="md"
        border="1px solid"
        borderColor={'green.200'}
      >
        <Box>
          <Heading
            size="md"
            mb={1}
            color="gray.800"
          >
            📧 Gmail Integration
          </Heading>
          <Text
            fontSize="sm"
            color="gray.600"
          >
            Connected as:{' '}
            <Text
              as="span"
              fontWeight="bold"
            >
              {profile?.emailAddress}
            </Text>
          </Text>
        </Box>

        <HStack>
          <Button
            size="sm"
            variant="outline"
            onClick={signOut}
          >
            Disconnect
          </Button>
        </HStack>
      </Box>

      {/* Loading emails */}
      {isLoadingEmails && (
        <VStack py={8}>
          <Spinner
            size="md"
            color="blue.500"
          />
          <Text>Loading your emails...</Text>
        </VStack>
      )}

      {/* Email error */}
      {emailsError && (
        <Box
          p={4}
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          borderRadius="md"
          mb={4}
        >
          <Text color="red.600">⚠️ Failed to load emails: {emailsError}</Text>
        </Box>
      )}

      {/* Emails with Tabs */}
      {otherEmails.length > 0 || focusedEmails.length > 0 ? (
        <Box>
          {shouldShowFocusedOnly ? (
            // Show only focused emails when stressed
            <Box>
              <Heading
                size="sm"
                mb={4}
                color="gray.700"
              >
                Focused Emails ({focusedEmails.length})
              </Heading>
              {focusedEmails.length > 0 ? (
                <VStack align="stretch">
                  {focusedEmails.map((email) => (
                    <EmailItem
                      key={email.id}
                      email={email}
                    />
                  ))}
                </VStack>
              ) : (
                <VStack
                  py={8}
                  color="gray.500"
                >
                  <FiMail size={48} />
                  <Text>No focused emails</Text>
                </VStack>
              )}
            </Box>
          ) : (
            // Show tabs when not stressed
            <Box>
              {/* Custom Tab Implementation */}
              <HStack
                mb={4}
                borderBottom="1px solid"
                borderColor="gray.200"
              >
                <Button
                  variant={activeTab === 'focused' ? 'solid' : 'ghost'}
                  colorScheme={activeTab === 'focused' ? 'blue' : 'gray'}
                  size="sm"
                  onClick={() => setActiveTab('focused')}
                  borderRadius="md md 0 0"
                >
                  <HStack>
                    <FiAlertTriangle />
                    <Text>Focused</Text>
                    <Badge
                      ml={2}
                      size="sm"
                      variant="subtle"
                    >
                      {focusedEmails.length}
                    </Badge>
                  </HStack>
                </Button>
                <Button
                  variant={activeTab === 'others' ? 'solid' : 'ghost'}
                  colorScheme={activeTab === 'others' ? 'blue' : 'gray'}
                  size="sm"
                  onClick={() => setActiveTab('others')}
                  borderRadius="md md 0 0"
                >
                  <HStack>
                    <FiMail />
                    <Text>Others</Text>
                    <Badge
                      ml={2}
                      size="sm"
                      variant="subtle"
                    >
                      {otherEmails.length}
                    </Badge>
                  </HStack>
                </Button>
              </HStack>

              {/* Tab Content */}
              <Box>
                {activeTab === 'focused' ? (
                  focusedEmails.length > 0 ? (
                    <VStack align="stretch">
                      {focusedEmails.map((email) => (
                        <EmailItem
                          key={email.id}
                          email={email}
                        />
                      ))}
                    </VStack>
                  ) : (
                    <VStack
                      py={8}
                      color="gray.500"
                    >
                      <FiMail size={48} />
                      <Text>No focused emails</Text>
                    </VStack>
                  )
                ) : otherEmails.length > 0 ? (
                  <VStack align="stretch">
                    {otherEmails.map((email) => (
                      <EmailItem
                        key={email.id}
                        email={email}
                      />
                    ))}
                  </VStack>
                ) : (
                  <VStack
                    py={8}
                    color="gray.500"
                  >
                    <FiMail size={48} />
                    <Text>No other emails</Text>
                  </VStack>
                )}
              </Box>
            </Box>
          )}

          {/* Refresh button */}
          <Box
            textAlign="center"
            mt={5}
          >
            {' '}
            <Button
              onClick={() => fetchEmailsByPriority(maxEmails, maxEmails)}
              loading={isLoadingEmails}
              loadingText="Refreshing..."
              colorScheme="blue"
            >
              Refresh Emails
            </Button>
          </Box>
        </Box>
      ) : !isLoadingEmails && !emailsError ? (
        <VStack
          py={10}
          color="gray.500"
        >
          <FiMail size={48} />
          <Text>No emails found in your inbox.</Text>
        </VStack>
      ) : null}
    </Box>
  );
};

export default Emails;
