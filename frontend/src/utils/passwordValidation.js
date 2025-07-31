// Password validation utility
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  disallowedChars: ['<', '>', '"', "'", '&'],
  commonPasswords: [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'hello',
    'freedom', 'whatever', 'qazwsx', 'trustno1', 'jordan', 'harley',
    'rangers', 'iwantu', 'gandalf', 'starwars', 'silver', 'richard',
    'qwe123', 'matt', 'jordan', 'runner', 'jordan', 'michael', 'charlie',
    'andrew', 'martin', 'christopher', 'jessica', 'michelle', 'charlie',
    'andrew', 'matthew', 'joshua', 'andrew', 'daniel', 'anthony', 'kevin',
    'jason', 'mark', 'paul', 'donald', 'george', 'ronald', 'kenneth',
    'anthony', 'kevin', 'jason', 'matthew', 'gary', 'timothy', 'jose',
    'larry', 'jeffrey', 'frank', 'scott', 'eric', 'stephen', 'andrew',
    'raymond', 'gregory', 'joshua', 'jerry', 'dennis', 'walter', 'peter',
    'harold', 'douglas', 'henry', 'carl', 'arthur', 'ryan', 'roger'
  ]
};

export const validatePassword = (password) => {
  const errors = [];
  const warnings = [];
  
  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }
  
  // Check maximum length
  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must be no more than ${PASSWORD_REQUIREMENTS.maxLength} characters long`);
  }
  
  // Check for uppercase letters
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letters
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for numbers
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special characters
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }
  
  // Check for disallowed characters
  const disallowedFound = PASSWORD_REQUIREMENTS.disallowedChars.filter(char => password.includes(char));
  if (disallowedFound.length > 0) {
    errors.push(`Password cannot contain: ${disallowedFound.join(', ')}`);
  }
  
  // Check for common passwords
  if (PASSWORD_REQUIREMENTS.commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password');
  }
  
  // Additional strength checks (warnings)
  if (password.length < 12) {
    warnings.push('Consider using a longer password for better security');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{2,}/.test(password)) {
    warnings.push('Consider using multiple special characters for better security');
  }
  
  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Avoid repeated characters (e.g., "aaa", "111")');
  }
  
  // Check for sequential characters (as warning, not error)
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|890|012/i.test(password)) {
    warnings.push('Avoid sequential characters (e.g., "abc", "123")');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strength: calculatePasswordStrength(password)
  };
};

export const calculatePasswordStrength = (password) => {
  let score = 0;
  
  // Length contribution
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety contribution
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  // Bonus for mixed case and numbers
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[a-zA-Z]/.test(password)) score += 1;
  
  // Penalty for common patterns
  if (PASSWORD_REQUIREMENTS.commonPasswords.includes(password.toLowerCase())) score -= 2;
  if (/(.)\1{2,}/.test(password)) score -= 1;
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|890|012/i.test(password)) score -= 1;
  
  // Determine strength level
  if (score <= 2) return 'weak';
  if (score <= 4) return 'fair';
  if (score <= 6) return 'good';
  if (score <= 8) return 'strong';
  return 'very-strong';
};

export const getStrengthColor = (strength) => {
  switch (strength) {
    case 'weak': return 'text-red-500';
    case 'fair': return 'text-orange-500';
    case 'good': return 'text-yellow-500';
    case 'strong': return 'text-green-500';
    case 'very-strong': return 'text-emerald-500';
    default: return 'text-gray-500';
  }
};

export const getStrengthText = (strength) => {
  switch (strength) {
    case 'weak': return 'Weak';
    case 'fair': return 'Fair';
    case 'good': return 'Good';
    case 'strong': return 'Strong';
    case 'very-strong': return 'Very Strong';
    default: return 'Unknown';
  }
};

export const getPasswordRequirementsText = () => {
  return [
    `At least ${PASSWORD_REQUIREMENTS.minLength} characters long`,
    'At least one uppercase letter (A-Z)',
    'At least one lowercase letter (a-z)',
    'At least one number (0-9)',
    'At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
    'Cannot contain: < > " \' &'
  ];
}; 