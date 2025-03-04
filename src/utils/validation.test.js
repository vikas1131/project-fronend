// __tests__/validators.test.js

import {
  validateEmail,
  validatePassword,
  validatePincode,
  validatePhoneNumber,
  validateUsername,
  validateSecurityAnswer,
  validateRole,
  validateSpecialization,
  validateAvailability,
  validateAddress,
  validateConfirmPassword,
} from './validation';

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('returns true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });
    it('returns false for invalid email formats', () => {
      expect(validateEmail('invalidemail')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('invalid@com')).toBe(false);
      expect(validateEmail('invalid@.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('returns true for valid password', () => {
      // Must be 8-15 characters with at least one uppercase, one digit, and one special character.
      expect(validatePassword('Password1!')).toBe(true);
    });
    it('returns false if missing uppercase letter', () => {
      expect(validatePassword('password1!')).toBe(false);
    });
    it('returns false if missing digit', () => {
      expect(validatePassword('Password!')).toBe(false);
    });
    it('returns false if missing special character', () => {
      expect(validatePassword('Password1')).toBe(false);
    });
    it('returns false if too short', () => {
      expect(validatePassword('P1!a')).toBe(false);
    });
    it('returns false if too long', () => {
      expect(validatePassword('P'.repeat(16) + '1!')).toBe(false);
    });
  });

  describe('validatePincode', () => {
    it('returns true for a valid 6-digit pincode', () => {
      expect(validatePincode('110001')).toBe(true);
    });
    it('returns false if pincode starts with 0', () => {
      expect(validatePincode('010001')).toBe(false);
    });
    it('returns false for non-digit characters', () => {
      expect(validatePincode('1100A1')).toBe(false);
    });
    it('returns false for incorrect length', () => {
      expect(validatePincode('11001')).toBe(false);
      expect(validatePincode('1100011')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('returns true for valid phone number without country code', () => {
      expect(validatePhoneNumber('1234567890')).toBe(true);
    });
    it('returns true for valid phone number with country code', () => {
      expect(validatePhoneNumber('+911234567890')).toBe(true);
      expect(validatePhoneNumber('+1 1234567890')).toBe(true);
    });
    it('returns false for invalid phone numbers', () => {
      expect(validatePhoneNumber('12345')).toBe(false);
      expect(validatePhoneNumber('abcdefghij')).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('returns true for valid username', () => {
      expect(validateUsername('John Doe')).toBe(true);
    });
    it('returns false if username does not start with a letter', () => {
      expect(validateUsername('1John Doe')).toBe(false);
    });
    it('returns false if username is too short', () => {
      expect(validateUsername('Jo')).toBe(false);
    });
    it('returns false if username is too long', () => {
      expect(validateUsername('a'.repeat(31))).toBe(false);
    });
  });

  describe('validateSecurityAnswer', () => {
    it('returns true for a valid security answer', () => {
      expect(validateSecurityAnswer('My secret answer')).toBe(true);
    });
    it('returns false if the answer is too short', () => {
      expect(validateSecurityAnswer('No')).toBe(false);
    });
    it('returns false if the answer is too long', () => {
      expect(validateSecurityAnswer('a'.repeat(51))).toBe(false);
    });
  });

  describe('validateRole', () => {
    it('returns true for valid roles', () => {
      expect(validateRole('Engineer')).toBe(true);
      expect(validateRole('User')).toBe(true);
      expect(validateRole('Admin')).toBe(true);
    });
    it('returns false for invalid roles', () => {
      expect(validateRole('Manager')).toBe(false);
      expect(validateRole('')).toBe(false);
    });
  });

  describe('validateSpecialization', () => {
    it('returns true for valid specialization', () => {
      expect(validateSpecialization('Cardiology')).toBe(true);
    });
    it('returns false if too short', () => {
      expect(validateSpecialization('Ca')).toBe(false);
    });
    it('returns false if contains invalid characters', () => {
      expect(validateSpecialization('Cardio123')).toBe(false);
    });
  });

  describe('validateAvailability', () => {
    it('returns true for a non-empty array', () => {
      expect(validateAvailability([1, 2, 3])).toBe(true);
    });
    it('returns false for an empty array', () => {
      expect(validateAvailability([])).toBe(false);
    });
    it('returns false for non-array input', () => {
      expect(validateAvailability('not an array')).toBe(false);
    });
  });

  describe('validateAddress', () => {
    it('returns true for a valid address', () => {
      expect(validateAddress('123 Main Street')).toBe(true);
    });
    it('returns false if the address is too short', () => {
      expect(validateAddress('1234')).toBe(false);
    });
    it('returns false if the address is too long', () => {
      expect(validateAddress('a'.repeat(101))).toBe(false);
    });
  });

  describe('validateConfirmPassword', () => {
    it('returns true when both passwords match', () => {
      expect(validateConfirmPassword('Password1!', 'Password1!')).toBe(true);
    });
    it('returns false when passwords do not match', () => {
      expect(validateConfirmPassword('Password1!', 'Password2!')).toBe(false);
    });
  });
});