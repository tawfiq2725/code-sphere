// utils/validators.ts

export const validateEmail = (value: string) => {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(value) || "Invalid email address";
};

export const validatePassword = (value: string) => {
  return value.length >= 6 || "Password must be at least 6 characters long";
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
) => {
  return password === confirmPassword || "Passwords do not match";
};
