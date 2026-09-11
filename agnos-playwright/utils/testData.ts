/**
 * Centralized test data. Credentials come from environment variables so
 * nothing sensitive is hardcoded or committed to source control.
 */
export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://dev.app.agnoshealth.com/ai_dashboard',
  username: process.env.TEST_USERNAME ?? '',
  password: process.env.TEST_PASSWORD ?? '',
  invalidUsername: process.env.INVALID_USERNAME ?? 'not-a-real-user@gmail.com',
  invalidPassword: process.env.INVALID_PASSWORD ?? 'WrongPassword123!',
};

/** Generates a unique, valid-format email for registration tests so runs never collide. */
export function uniqueTestEmail(prefix = 'agnos.qa'): string {
  return `${prefix}.${Date.now()}@gmail.com`;
}

/** A password that satisfies the app's documented policy (8+ chars, upper, digit, special char). */
export const strongPassword = 'Valid@1234';

export const weakPasswords = {
  tooShort: 'abc',
  noUppercase: 'valid@1234',
  noDigit: 'Valid@abcd',
  noSpecialChar: 'Valid1234',
};

export const invalidEmails = [
  'not-an-email',
  'missing-domain@',
  '@missing-local.com',
  'spaces in@email.com',
];
