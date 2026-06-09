const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;

  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 254) return false;

  return EMAIL_REGEX.test(trimmed);
};
