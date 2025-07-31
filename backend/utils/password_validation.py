import re
from typing import Dict, List, Tuple

# Password requirements configuration
PASSWORD_REQUIREMENTS = {
    'min_length': 8,
    'max_length': 128,
    'require_uppercase': True,
    'require_lowercase': True,
    'require_numbers': True,
    'require_special_chars': True,
    'disallowed_chars': ['<', '>', '"', "'", '&'],
    'common_passwords': [
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
}

def validate_password(password: str) -> Tuple[bool, List[str], List[str]]:
    """
    Validate password against security requirements.
    
    Args:
        password (str): The password to validate
        
    Returns:
        Tuple[bool, List[str], List[str]]: (is_valid, list_of_errors, list_of_warnings)
    """
    errors = []
    warnings = []
    
    # Check minimum length
    if len(password) < PASSWORD_REQUIREMENTS['min_length']:
        errors.append(f"Password must be at least {PASSWORD_REQUIREMENTS['min_length']} characters long")
    
    # Check maximum length
    if len(password) > PASSWORD_REQUIREMENTS['max_length']:
        errors.append(f"Password must be no more than {PASSWORD_REQUIREMENTS['max_length']} characters long")
    
    # Check for uppercase letters
    if PASSWORD_REQUIREMENTS['require_uppercase'] and not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
    
    # Check for lowercase letters
    if PASSWORD_REQUIREMENTS['require_lowercase'] and not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")
    
    # Check for numbers
    if PASSWORD_REQUIREMENTS['require_numbers'] and not re.search(r'\d', password):
        errors.append("Password must contain at least one number")
    
    # Check for special characters
    if PASSWORD_REQUIREMENTS['require_special_chars'] and not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password):
        errors.append("Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)")
    
    # Check for disallowed characters
    disallowed_found = [char for char in PASSWORD_REQUIREMENTS['disallowed_chars'] if char in password]
    if disallowed_found:
        errors.append(f"Password cannot contain: {', '.join(disallowed_found)}")
    
    # Check for common passwords
    if password.lower() in PASSWORD_REQUIREMENTS['common_passwords']:
        errors.append("Password is too common. Please choose a more unique password")
    
    # Check for repeated characters
    if re.search(r'(.)\1{2,}', password):
        errors.append("Avoid repeated characters (e.g., 'aaa', '111')")
    
    # Check for sequential characters (as warning, not error)
    if re.search(r'abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|890|012', password, re.IGNORECASE):
        warnings.append("Avoid sequential characters (e.g., 'abc', '123')")
    
    return len(errors) == 0, errors, warnings

def calculate_password_strength(password: str) -> str:
    """
    Calculate password strength level.
    
    Args:
        password (str): The password to evaluate
        
    Returns:
        str: Strength level ('weak', 'fair', 'good', 'strong', 'very-strong')
    """
    score = 0
    
    # Length contribution
    if len(password) >= 8:
        score += 1
    if len(password) >= 12:
        score += 1
    if len(password) >= 16:
        score += 1
    
    # Character variety contribution
    if re.search(r'[a-z]', password):
        score += 1
    if re.search(r'[A-Z]', password):
        score += 1
    if re.search(r'\d', password):
        score += 1
    if re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password):
        score += 1
    
    # Bonus for mixed case and numbers
    if re.search(r'[a-z]', password) and re.search(r'[A-Z]', password):
        score += 1
    if re.search(r'\d', password) and re.search(r'[a-zA-Z]', password):
        score += 1
    
    # Penalty for common patterns
    if password.lower() in PASSWORD_REQUIREMENTS['common_passwords']:
        score -= 2
    if re.search(r'(.)\1{2,}', password):
        score -= 1
    if re.search(r'abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|890|012', password, re.IGNORECASE):
        score -= 1
    
    # Determine strength level
    if score <= 2:
        return 'weak'
    elif score <= 4:
        return 'fair'
    elif score <= 6:
        return 'good'
    elif score <= 8:
        return 'strong'
    else:
        return 'very-strong'

def get_password_requirements() -> List[str]:
    """
    Get list of password requirements for display.
    
    Returns:
        List[str]: List of requirement descriptions
    """
    return [
        f"At least {PASSWORD_REQUIREMENTS['min_length']} characters long",
        "At least one uppercase letter (A-Z)",
        "At least one lowercase letter (a-z)",
        "At least one number (0-9)",
        "At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)",
        "Cannot contain: < > \" ' &"
    ] 