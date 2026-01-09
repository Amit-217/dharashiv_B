// src/utils/helpers.js

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error("Phone number must be exactly 10 digits");
  }
};

export const validateEmail = (email) => {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    throw new Error("Invalid email address");
  }
};
