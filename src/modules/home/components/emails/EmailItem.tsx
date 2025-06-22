import { FiCalendar } from 'react-icons/fi';
import { Box, HStack, Text, Heading, Badge } from '@chakra-ui/react';

import type { GmailMessageWithStress } from '../../../../shared/types/gmail.types';
import formatDate from '../../infrastructure/helpers/formatDate';
import getPriorityIcon from '../../infrastructure/helpers/getPriorityIcon';
import getStressColor from '../../infrastructure/helpers/getStressColor';

const EmailItem = ({ email }: { email: GmailMessageWithStress }) => {
  return (
    <Box
      p={4}
      mb={3}
      borderRadius="md"
      border="1px solid"
      borderColor={getStressColor(email.stressAnalysis?.priority || 'low')}
      bg={email.read ? 'gray.50' : 'white'}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-1px)',
        boxShadow: 'md',
      }}
    >
      <HStack
        justify="space-between"
        align="flex-start"
        mb={2}
      >
        <HStack>
          {getPriorityIcon(email.stressAnalysis?.priority || 'low')}
          <Text
            fontSize="sm"
            fontWeight={email.read ? 'normal' : 'bold'}
          >
            {email.from.includes('<') ? email.from.split('<')[0].trim() : email.from}
          </Text>
        </HStack>
        <HStack
          fontSize="xs"
          color="gray.500"
        >
          <FiCalendar />
          <Text>{formatDate(email.date)}</Text>
        </HStack>
      </HStack>

      <Heading
        size="sm"
        mb={1}
        fontWeight={email.read ? 'normal' : 'bold'}
        color="gray.800"
      >
        {email.subject || '(No Subject)'}
      </Heading>

      <Text
        fontSize="sm"
        color="gray.600"
        truncate
      >
        {email.snippet}
      </Text>

      {email.stressAnalysis && (
        <Badge
          mt={2}
          colorScheme={
            email.stressAnalysis.priority === 'high'
              ? 'red'
              : email.stressAnalysis.priority === 'medium'
                ? 'orange'
                : 'green'
          }
          variant="subtle"
        >
          {email.stressAnalysis.priority.toUpperCase()} PRIORITY
        </Badge>
      )}
    </Box>
  );
};

export default EmailItem;
