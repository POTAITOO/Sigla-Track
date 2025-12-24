// Firebase error message mapper
export const getFirebaseErrorMessage = (code: string): string => {
  const errorMessages: { [key: string]: string } = {
    // Authentication errors
    'auth/user-not-found': 'No account found with this email address',
    'auth/invalid-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/invalid-credentials': 'Invalid email or password',
    'auth/wrong-password': 'Incorrect password',
    'auth/user-disabled': 'This account has been disabled',
    'auth/email-already-in-use': 'Email is already registered',
    'auth/weak-password': 'Password must be at least 6 characters',
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled',
    'auth/too-many-requests': 'Too many failed login attempts. Please try again later',
    'auth/account-exists-with-different-credential': 'Account exists with different sign-in method',
    'auth/invalid-verification-code': 'Invalid verification code',
    'auth/invalid-verification-id': 'Invalid verification ID',
    
    // Network errors
    'auth/network-request-failed': 'Network error. Please check your internet connection',
    
    // Default
    'default': 'Login failed. Please try again',
  };

  // Extract the error code if it's in format "Firebase: Error (auth/code)."
  let extractedCode = code;
  if (code.includes('(') && code.includes(')')) {
    const match = code.match(/\(([^)]+)\)/);
    if (match) {
      extractedCode = match[1];
    }
  }

  return errorMessages[extractedCode] || errorMessages['default'];
};
