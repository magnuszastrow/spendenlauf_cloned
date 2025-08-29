import DOMPurify from 'dompurify';
import validator from 'validator';

// Rate limiting storage (in-memory for demo - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const securityConfig = {
  maxSubmissionsPerHour: 5,
  maxSubmissionsPerDay: 10,
  requiredCaptchaScore: 0.5,
  allowedDomains: ['gmail.com', 'yahoo.com', 'outlook.com', 'web.de', 't-online.de'], // Common email domains
};

/**
 * Light sanitization for real-time input - preserves whitespace during typing
 */
export const sanitizeInputLight = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags but preserve internal whitespace
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  });
};

/**
 * Full sanitization for form submission - removes leading/trailing whitespace
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove any HTML tags and encode special characters
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  }).trim();
};

/**
 * Validate and sanitize email input
 */
export const validateEmail = (email: string): { isValid: boolean; sanitized: string; error?: string } => {
  const sanitized = sanitizeInput(email).toLowerCase();
  
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'E-Mail ist erforderlich' };
  }
  
  if (!validator.isEmail(sanitized)) {
    return { isValid: false, sanitized, error: 'Ungültige E-Mail-Adresse' };
  }
  
  if (sanitized.length > 254) {
    return { isValid: false, sanitized, error: 'E-Mail-Adresse ist zu lang' };
  }
  
  return { isValid: true, sanitized };
};

/**
 * Validate name input
 */
export const validateName = (name: string): { isValid: boolean; sanitized: string; error?: string } => {
  const sanitized = sanitizeInput(name);
  
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Name ist erforderlich' };
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, sanitized, error: 'Name muss mindestens 2 Zeichen lang sein' };
  }
  
  if (sanitized.length > 50) {
    return { isValid: false, sanitized, error: 'Name ist zu lang (max. 50 Zeichen)' };
  }
  
  // Check for suspicious patterns
  if (/[<>\"'&]/.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Name enthält ungültige Zeichen' };
  }
  
  return { isValid: true, sanitized };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string): { isValid: boolean; sanitized: string; error?: string } => {
  const sanitized = sanitizeInput(phone).replace(/\s+/g, '');
  
  if (!sanitized) {
    return { isValid: true, sanitized: '' }; // Phone is optional
  }
  
  if (!validator.isMobilePhone(sanitized, 'de-DE', { strictMode: false })) {
    return { isValid: false, sanitized, error: 'Ungültige Telefonnummer' };
  }
  
  return { isValid: true, sanitized };
};

/**
 * Validate address input
 */
export const validateAddress = (address: string): { isValid: boolean; sanitized: string; error?: string } => {
  const sanitized = sanitizeInput(address);
  
  if (!sanitized) {
    return { isValid: false, sanitized: '', error: 'Adresse ist erforderlich' };
  }
  
  if (sanitized.length < 5) {
    return { isValid: false, sanitized, error: 'Adresse ist zu kurz' };
  }
  
  if (sanitized.length > 200) {
    return { isValid: false, sanitized, error: 'Adresse ist zu lang (max. 200 Zeichen)' };
  }
  
  return { isValid: true, sanitized };
};

/**
 * Rate limiting check
 */
export const checkRateLimit = (identifier: string): { allowed: boolean; error?: string } => {
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  const dayAgo = now - (24 * 60 * 60 * 1000);
  
  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < dayAgo) {
      rateLimitStore.delete(key);
    }
  }
  
  const hourlyKey = `${identifier}_hourly_${Math.floor(now / (60 * 60 * 1000))}`;
  const dailyKey = `${identifier}_daily_${Math.floor(now / (24 * 60 * 60 * 1000))}`;
  
  const hourlyCount = rateLimitStore.get(hourlyKey)?.count || 0;
  const dailyCount = rateLimitStore.get(dailyKey)?.count || 0;
  
  if (hourlyCount >= securityConfig.maxSubmissionsPerHour) {
    return { 
      allowed: false, 
      error: 'Zu viele Anmeldungen in der letzten Stunde. Bitte versuchen Sie es später erneut.' 
    };
  }
  
  if (dailyCount >= securityConfig.maxSubmissionsPerDay) {
    return { 
      allowed: false, 
      error: 'Zu viele Anmeldungen heute. Bitte versuchen Sie es morgen erneut.' 
    };
  }
  
  return { allowed: true };
};

/**
 * Record a submission for rate limiting
 */
export const recordSubmission = (identifier: string): void => {
  const now = Date.now();
  const resetTime = now + (24 * 60 * 60 * 1000);
  
  const hourlyKey = `${identifier}_hourly_${Math.floor(now / (60 * 60 * 1000))}`;
  const dailyKey = `${identifier}_daily_${Math.floor(now / (24 * 60 * 60 * 1000))}`;
  
  // Update hourly count
  const hourlyEntry = rateLimitStore.get(hourlyKey) || { count: 0, resetTime };
  rateLimitStore.set(hourlyKey, { count: hourlyEntry.count + 1, resetTime });
  
  // Update daily count
  const dailyEntry = rateLimitStore.get(dailyKey) || { count: 0, resetTime };
  rateLimitStore.set(dailyKey, { count: dailyEntry.count + 1, resetTime });
};

/**
 * Simple math CAPTCHA generator
 */
export const generateMathCaptcha = (): { question: string; answer: number } => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let answer: number;
  let question: string;
  
  switch (operation) {
    case '+':
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
      break;
    case '-':
      // Ensure positive result
      const [larger, smaller] = num1 >= num2 ? [num1, num2] : [num2, num1];
      answer = larger - smaller;
      question = `${larger} - ${smaller}`;
      break;
    case '*':
      // Use smaller numbers for multiplication
      const small1 = Math.floor(Math.random() * 5) + 1;
      const small2 = Math.floor(Math.random() * 5) + 1;
      answer = small1 * small2;
      question = `${small1} × ${small2}`;
      break;
    default:
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
  }
  
  return { question, answer };
};

/**
 * Validate CAPTCHA answer
 */
export const validateCaptcha = (userAnswer: string, correctAnswer: number): boolean => {
  const sanitizedAnswer = sanitizeInput(userAnswer);
  const numericAnswer = parseInt(sanitizedAnswer, 10);
  
  return !isNaN(numericAnswer) && numericAnswer === correctAnswer;
};

/**
 * Get client identifier for rate limiting (IP simulation)
 */
export const getClientIdentifier = (): string => {
  // In a real app, this would be the client's IP address
  // For demo purposes, we'll use a combination of user agent and local storage
  const userAgent = navigator.userAgent;
  const storageKey = 'client_id';
  
  let clientId = localStorage.getItem(storageKey);
  if (!clientId) {
    clientId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem(storageKey, clientId);
  }
  
  return `${clientId}_${btoa(userAgent).substring(0, 10)}`;
};