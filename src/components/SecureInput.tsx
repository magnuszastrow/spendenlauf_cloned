import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { sanitizeInput, sanitizeInputLight } from '@/lib/security';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSecureChange?: (sanitizedValue: string) => void;
}

export const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({ onSecureChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Use light sanitization during typing to preserve whitespace
      const lightSanitizedValue = sanitizeInputLight(e.target.value);
      
      // Update the input with light sanitized value
      if (e.target.value !== lightSanitizedValue) {
        e.target.value = lightSanitizedValue;
      }
      
      // Call the secure change handler with light sanitized value
      if (onSecureChange) {
        onSecureChange(lightSanitizedValue);
      }
      
      // Call the original onChange if provided
      if (onChange) {
        onChange(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Apply full sanitization on blur
      const fullSanitizedValue = sanitizeInput(e.target.value);
      
      if (e.target.value !== fullSanitizedValue) {
        e.target.value = fullSanitizedValue;
        
        // Trigger change event to update form state
        if (onSecureChange) {
          onSecureChange(fullSanitizedValue);
        }
        
        if (onChange) {
          const syntheticEvent = {
            ...e,
            target: e.target,
            currentTarget: e.target
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        onChange={handleChange}
        onBlur={handleBlur}
        autoComplete="off"
        spellCheck={false}
      />
    );
  }
);

SecureInput.displayName = 'SecureInput';