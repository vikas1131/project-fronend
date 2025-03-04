export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email);
  };
  
  export const validatePassword = (password) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password);
  };
  
  export const validatePincode = (pincode) => {
    return /^[1-9][0-9]{5}$/.test(pincode); // Basic 6-digit Indian pincode validation
  };
  
  export const validatePhoneNumber = (phone) => {
    return /^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone);
  };
  
  export const validateUsername = (name) => {
    return /^[a-zA-Z][a-zA-Z\s]{2,30}$/.test(name); // Name should start with a letter, be 3-30 characters long, and allow spaces
  };
  
  export const validateSecurityAnswer = (answer) => {
    return answer.length >= 3 && answer.length <= 50; // Security answer should be between 3-50 characters
  };
  
  export const validateRole = (role) => {
    const validRoles = ["Engineer", "User", "Admin"];
    return validRoles.includes(role);
  };
  
  export const validateSpecialization = (specialization) => {
    return /^[a-zA-Z\s]{3,50}$/.test(specialization); // Allow alphabets and spaces, 3-50 characters
  };
  
  export const validateAvailability = (availability) => {
    return Array.isArray(availability) && availability.length > 0; // Must be a non-empty array
  };
  
  export const validateAddress = (address) => {
    return address.length >= 5 && address.length <= 100; // Address should be 5-100 characters
  };
  
  export const validateConfirmPassword = (password, confirmPassword) => {
    return password === confirmPassword;
  };
  