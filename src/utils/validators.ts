export type ValidationResult = string | true;

export const validateRequired = (
  value: string,
  fieldName: string
): ValidationResult => {
  return value.trim() ? true : `${fieldName} is required`;
};

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? true : "Invalid email format";
};

export const validatePassword = (password: string): ValidationResult => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return true;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  return password === confirmPassword ? true : "Passwords do not match";
};

export const validateForm = (
  formData: Record<string, string>
): string | true => {
  for (const [field, value] of Object.entries(formData)) {
    const requiredCheck = validateRequired(value, field);
    if (requiredCheck !== true) return requiredCheck;
  }

  if (formData.email) {
    const emailCheck = validateEmail(formData.email);
    if (emailCheck !== true) return emailCheck;
  }

  if (formData.password) {
    const passwordCheck = validatePassword(formData.password);
    if (passwordCheck !== true) return passwordCheck;
  }

  if (formData.confirmPassword) {
    const confirmPasswordCheck = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (confirmPasswordCheck !== true) return confirmPasswordCheck;
  }

  return true;
};
