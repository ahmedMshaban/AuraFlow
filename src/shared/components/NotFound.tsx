import { Link } from 'react-router';
import { Box, Flex, Heading, Text, Button, Stack } from '@chakra-ui/react';

export const NotFound = () => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg="gray.50"
    >
      <Box textAlign="center">
        <Heading
          as="h1"
          size="4xl"
          color="gray.400"
          fontWeight="bold"
          mb={4}
        >
          404
        </Heading>
        <Heading
          as="h2"
          size="lg"
          color="gray.700"
          mb={4}
        >
          Page Not Found
        </Heading>
        <Text
          color="gray.600"
          mb={8}
          fontSize="lg"
        >
          The page you're looking for doesn't exist or has been moved.
        </Text>{' '}
        <Stack
          direction="row"
          gap={4}
          justify="center"
        >
          <Link to="/home">
            <Button
              colorPalette="blue"
              size="lg"
            >
              Go to Home
            </Button>
          </Link>
          <Link to="/login">
            <Button
              variant="outline"
              colorPalette="gray"
              size="lg"
            >
              Go to Login
            </Button>
          </Link>
        </Stack>
      </Box>
    </Flex>
  );
};
