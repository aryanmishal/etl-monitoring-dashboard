import React from 'react';
import { 
  validatePassword, 
  getStrengthColor, 
  getStrengthText, 
  getPasswordRequirementsText 
} from '../utils/passwordValidation';

export default function PasswordStrengthIndicator({ password, showRequirements = true }) {
  const validation = validatePassword(password);
  const strengthColor = getStrengthColor(validation.strength);
  const strengthText = getStrengthText(validation.strength);
  const requirements = getPasswordRequirementsText();

  // Calculate strength percentage for progress bar
  const getStrengthPercentage = (strength) => {
    switch (strength) {
      case 'weak': return 20;
      case 'fair': return 40;
      case 'good': return 60;
      case 'strong': return 80;
      case 'very-strong': return 100;
      default: return 0;
    }
  };

  const strengthPercentage = getStrengthPercentage(validation.strength);

  return (
    <div className="mt-2 space-y-3">
      {/* Password Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Password Strength:</span>
          <span className={`text-sm font-semibold ${strengthColor}`}>
            {strengthText}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              strengthColor === 'text-red-500' ? 'bg-red-500' :
              strengthColor === 'text-orange-500' ? 'bg-orange-500' :
              strengthColor === 'text-yellow-500' ? 'bg-yellow-500' :
              strengthColor === 'text-green-500' ? 'bg-green-500' :
              strengthColor === 'text-emerald-500' ? 'bg-emerald-500' :
              'bg-gray-300'
            }`}
            style={{ width: `${strengthPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Password Requirements */}
      {showRequirements && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Password Requirements:</h4>
          <ul className="space-y-1">
            {requirements.map((requirement, index) => {
              const isMet = validation.errors.length === 0 || 
                !validation.errors.some(error => 
                  error.toLowerCase().includes(requirement.toLowerCase().split(' ')[0])
                );
              
              return (
                <li key={index} className="flex items-center space-x-2">
                  <svg 
                    className={`w-4 h-4 ${isMet ? 'text-green-500' : 'text-gray-400'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  <span className={`text-xs ${isMet ? 'text-green-600' : 'text-gray-500'}`}>
                    {requirement}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
} 