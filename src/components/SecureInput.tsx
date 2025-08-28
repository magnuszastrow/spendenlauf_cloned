import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { sanitizeInput } from '@/lib/security';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSecureChange?: (sanitizedValue: string) => void;
}

export const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(
  ({ onSecureChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitizedValue = sanitizeInput(e.target.value);
      
      // Update the input with sanitized value
      if (e.target.value !== sanitizedValue) {
        e.target.value = sanitizedValue;
      }
      
      // Call the secure change handler
      if (onSecureChange) {
        onSecureChange(sanitizedValue);
      }
      
      // Call the original onChange if provided
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        onChange={handleChange}
        autoComplete="off"
        spellCheck={false}
      />
    );
  }
);

SecureInput.displayName = 'SecureInput';