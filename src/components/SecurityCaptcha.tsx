import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { generateMathCaptcha, validateCaptcha } from '@/lib/security';

interface SecurityCaptchaProps {
  onValidation: (isValid: boolean) => void;
  error?: string;
}

export const SecurityCaptcha = ({ onValidation, error }: SecurityCaptchaProps) => {
  const [captcha, setCaptcha] = useState(generateMathCaptcha());
  const [userAnswer, setUserAnswer] = useState('');
  const [isValid, setIsValid] = useState(false);

  const refreshCaptcha = () => {
    setCaptcha(generateMathCaptcha());
    setUserAnswer('');
    setIsValid(false);
    onValidation(false);
  };

  const handleAnswerChange = (value: string) => {
    setUserAnswer(value);
    const valid = validateCaptcha(value, captcha.answer);
    setIsValid(valid);
    onValidation(valid);
  };

  useEffect(() => {
    // Generate new captcha on mount
    refreshCaptcha();
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="captcha">
        Sicherheitsprüfung: Was ist {captcha.question}?
      </Label>
      <div className="flex gap-2">
        <Input
          id="captcha"
          type="number"
          value={userAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder="Antwort eingeben"
          className={error ? 'border-red-500' : isValid ? 'border-green-500' : ''}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={refreshCaptcha}
          title="Neue Aufgabe generieren"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {isValid && (
        <p className="text-sm text-green-600">✓ Sicherheitsprüfung bestanden</p>
      )}
    </div>
  );
};