import type { ButtonProps, GroupProps, InputProps, StackProps } from '@chakra-ui/react';
import { Box, HStack, IconButton, Input, InputGroup, Stack, mergeRefs, useControllableState } from '@chakra-ui/react';
import * as React from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';

/**
 * Props for controlling password visibility functionality.
 */
export interface PasswordVisibilityProps {
  /** Default visibility state of the password */
  defaultVisible?: boolean;
  /** Controlled visibility state of the password */
  visible?: boolean;
  /** Callback fired when visibility state changes */
  onVisibleChange?: (visible: boolean) => void;
  /** Custom icons for visibility toggle (on: visible, off: hidden) */
  visibilityIcon?: { on: React.ReactNode; off: React.ReactNode };
}

/**
 * Props for the PasswordInput component extending standard InputProps.
 */
export interface PasswordInputProps extends InputProps, PasswordVisibilityProps {
  /** Props passed to the root InputGroup container */
  rootProps?: GroupProps;
}

/**
 * A secure password input component with visibility toggle functionality.
 * Provides enhanced user experience for password fields with show/hide capability,
 * accessibility features, and customizable icons.
 *
 * Features:
 * - Password visibility toggle with eye icons
 * - Accessible design with proper ARIA labels
 * - Controlled and uncontrolled visibility states
 * - Customizable visibility icons
 * - Integration with Chakra UI Input system
 * - Proper focus management and keyboard navigation
 * - Disabled state support
 *
 * Security Considerations:
 * - Password is masked by default for security
 * - Visibility toggle helps users verify correct input
 * - No password value is stored in component state
 * - Proper input type switching (password/text)
 *
 * @param props - The component props extending InputProps
 * @returns A password input with visibility toggle functionality
 *
 * @example
 * ```tsx
 * // Basic usage
 * <PasswordInput placeholder="Enter password" />
 *
 * // Controlled visibility
 * const [isVisible, setIsVisible] = useState(false);
 * <PasswordInput
 *   visible={isVisible}
 *   onVisibleChange={setIsVisible}
 *   placeholder="Enter password"
 * />
 *
 * // With form integration
 * <PasswordInput
 *   {...register('password')}
 *   placeholder="Enter password"
 *   disabled={isLoading}
 * />
 * ```
 *
 * @note Component uses forwardRef for proper form library integration
 * @note Visibility toggle is disabled when input is disabled
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(props, ref) {
  const {
    rootProps,
    defaultVisible,
    visible: visibleProp,
    onVisibleChange,
    visibilityIcon = { on: <LuEye />, off: <LuEyeOff /> },
    ...rest
  } = props;

  const [visible, setVisible] = useControllableState({
    value: visibleProp,
    defaultValue: defaultVisible || false,
    onChange: onVisibleChange,
  });

  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <InputGroup
      endElement={
        <VisibilityTrigger
          disabled={rest.disabled}
          onPointerDown={(e) => {
            if (rest.disabled) return;
            if (e.button !== 0) return;
            e.preventDefault();
            setVisible(!visible);
          }}
        >
          {visible ? visibilityIcon.off : visibilityIcon.on}
        </VisibilityTrigger>
      }
      {...rootProps}
    >
      <Input
        {...rest}
        ref={mergeRefs(ref, inputRef)}
        type={visible ? 'text' : 'password'}
      />
    </InputGroup>
  );
});

/**
 * Internal component for the password visibility toggle button.
 * Provides accessible button for toggling password visibility with proper styling.
 *
 * @param props - Button props for the visibility trigger
 * @returns An icon button for toggling password visibility
 *
 * @note Component uses tabIndex={-1} to prevent focus during tab navigation
 * @note Button is positioned absolutely within the input group
 */
const VisibilityTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(function VisibilityTrigger(props, ref) {
  return (
    <IconButton
      tabIndex={-1}
      ref={ref}
      me="-2"
      aspectRatio="square"
      size="sm"
      variant="ghost"
      height="calc(100% - {spacing.2})"
      aria-label="Toggle password visibility"
      {...props}
    />
  );
});

/**
 * Props for the PasswordStrengthMeter component.
 */
interface PasswordStrengthMeterProps extends StackProps {
  /** Maximum strength value (number of strength levels) */
  max?: number;
  /** Current strength value (0 to max) */
  value: number;
}

/**
 * A visual password strength meter component with color-coded strength indicators.
 * Displays password strength as a series of colored bars with textual feedback
 * to help users create secure passwords.
 *
 * Features:
 * - Visual strength indication with colored progress bars
 * - Textual strength labels (Low, Medium, High)
 * - Configurable maximum strength levels
 * - Color-coded strength levels (red, orange, green)
 * - Responsive design with flexible bar layout
 * - Accessible design with proper color contrast
 *
 * Strength Levels:
 * - Low (0-33%): Red color palette for weak passwords
 * - Medium (34-66%): Orange color palette for moderate passwords
 * - High (67-100%): Green color palette for strong passwords
 *
 * @param props - The component props extending StackProps
 * @param props.max - Maximum number of strength levels (default: 4)
 * @param props.value - Current strength value from 0 to max
 * @returns A visual password strength meter with progress indicators
 *
 * @example
 * ```tsx
 * // Basic usage with default 4 levels
 * <PasswordStrengthMeter value={2} />
 *
 * // Custom maximum levels
 * <PasswordStrengthMeter max={5} value={3} />
 *
 * // Integrated with password validation
 * const strength = calculatePasswordStrength(password);
 * <PasswordStrengthMeter value={strength} max={4} />
 * ```
 *
 * @note Component automatically calculates percentage and color based on value/max ratio
 * @note Strength labels are displayed only when a label is determined
 */
export const PasswordStrengthMeter = React.forwardRef<HTMLDivElement, PasswordStrengthMeterProps>(
  function PasswordStrengthMeter(props, ref) {
    const { max = 4, value, ...rest } = props;

    const percent = (value / max) * 100;
    const { label, colorPalette } = getColorPalette(percent);

    return (
      <Stack
        align="flex-end"
        gap="1"
        ref={ref}
        {...rest}
      >
        <HStack
          width="full"
          ref={ref}
          {...rest}
        >
          {Array.from({ length: max }).map((_, index) => (
            <Box
              key={index}
              height="1"
              flex="1"
              rounded="sm"
              data-selected={index < value ? '' : undefined}
              layerStyle="fill.subtle"
              colorPalette="gray"
              _selected={{
                colorPalette,
                layerStyle: 'fill.solid',
              }}
            />
          ))}
        </HStack>
        {label && <HStack textStyle="xs">{label}</HStack>}
      </Stack>
    );
  },
);

/**
 * Utility function to determine color palette and label based on password strength percentage.
 * Provides consistent color coding and labeling for password strength visualization.
 *
 * @param percent - Password strength as percentage (0-100)
 * @returns Object containing label and colorPalette for the strength level
 *
 * @example
 * ```typescript
 * getColorPalette(25);  // { label: 'Low', colorPalette: 'red' }
 * getColorPalette(50);  // { label: 'Medium', colorPalette: 'orange' }
 * getColorPalette(80);  // { label: 'High', colorPalette: 'green' }
 * ```
 */
function getColorPalette(percent: number) {
  switch (true) {
    case percent < 33:
      return { label: 'Low', colorPalette: 'red' };
    case percent < 66:
      return { label: 'Medium', colorPalette: 'orange' };
    default:
      return { label: 'High', colorPalette: 'green' };
  }
}
