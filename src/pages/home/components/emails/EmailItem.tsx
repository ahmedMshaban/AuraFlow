import { FiCalendar } from 'react-icons/fi';
import { Box, HStack, Text, Heading, Badge } from '@chakra-ui/react';

import type { GmailMessageWithStress } from '@/shared/types/gmail.types';
import formatDate from '../../infrastructure/helpers/formatDate';
import getPriorityIcon from '../../infrastructure/helpers/getPriorityIcon';
import getStressColor from '../../infrastructure/helpers/getStressColor';
import openGmailEmail from '../../infrastructure/helpers/openGmailEmail';

/**
 * An individual email display component with stress analysis integration and interactive features.
 * Renders email information with visual priority indicators, read/unread states,
 * and click-to-open functionality for Gmail integration.
 *
 * Features:
 * - Visual priority indicators with color-coded borders
 * - Read/unread state styling with appropriate font weights
 * - Interactive hover effects and click-to-open functionality
 * - Stress analysis priority badges for user guidance
 * - Responsive date formatting with relative timestamps
 * - Sender name extraction and display optimization
 * - Subject and snippet display with fallbacks
 *
 * Visual Indicators:
 * - Border colors based on stress analysis priority
 * - Priority icons (high/medium/low) with stress context
 * - Bold text for unread emails, normal weight for read
 * - Priority badges with color-coded importance levels
 * - Hover effects for interactive feedback
 *
 * Stress Integration:
 * - Priority analysis affects visual presentation
 * - Color coding helps users identify important emails quickly
 * - Badge system provides clear priority communication
 * - Supports stress-aware email management workflows
 *
 * @param props - The component props
 * @param props.email - Gmail message data with stress analysis
 * @returns An interactive email item with priority indicators
 *
 * @example
 * ```tsx
 * const emailWithStress: GmailMessageWithStress = {
 *   id: '123',
 *   subject: 'Important Meeting',
 *   from: 'boss@company.com',
 *   snippet: 'Can we meet tomorrow...',
 *   date: new Date(),
 *   read: false,
 *   stressAnalysis: { priority: 'high' }
 * };
 *
 * <EmailItem email={emailWithStress} />
 * ```
 *
 * @note Clicking the email opens it in Gmail via openGmailEmail helper
 * @note Component adapts visual styling based on stress analysis data
 * @see {@link GmailMessageWithStress} For email data structure
 * @see {@link openGmailEmail} For Gmail opening functionality
 * @see {@link getStressColor} For priority-based color coding
 * @see {@link getPriorityIcon} For priority icon display
 */
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
      onClick={() => openGmailEmail(email.id)}
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
          colorPalette={
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
