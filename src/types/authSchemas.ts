import { z } from 'zod';

/**
 * Minimum age requirement for user registration (in years)
 * @constant {number}
 */
const MINIMUM_AGE = 13;

/**
 * Error message shown when user is below minimum age
 * @constant {string}
 */
const MINIMUM_AGE_MESSAGE =
  "Sorry, but you don't meet SoundCloud's minimum age requirements";

/**
 * Zod schema for user registration validation
 * 
 * Validates:
 * - Email: Must be a valid email format
 * - Password: Minimum 6 characters, at least one uppercase letter and one number
 * - Confirm Password: Must match password field
 * - Display Name: Required, non-empty string
 * - Date of Birth: Must be valid date components (month, day, year) with user being 13+
 * - Gender: Required field
 * 
 * @type {z.ZodObject}
 * @example
 * const result = registrationSchema.safeParse(formData);
 * if (result.success) {
 *   // Use result.data
 * } else {
 *   // errors in result.error
 * }
 */
export const registrationSchema = z
  .object({
    email: z.string().trim().email('Enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters long.'),
    confirmPassword: z.string().min(1, 'Confirm password is required.'),
    displayName: z.string().trim().min(1, 'Display name is required.'),
    month: z.string().min(1, 'Month is required.'),
    day: z.string().min(1, 'Day is required.'),
    year: z.string().min(1, 'Year is required.'),
    gender: z.string().min(1, 'Gender is required.'),
  })
  .superRefine((values, ctx) => {
    if (!values.year) return;

    const year = Number(values.year);
    if (Number.isNaN(year)) return;

    const age = new Date().getFullYear() - year;
    if (age < MINIMUM_AGE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['year'],
        message: MINIMUM_AGE_MESSAGE,
      });
    }

    const password = values.password.trim();
    const confirmPassword = values.confirmPassword.trim();
    const isStrongPassword =
      password.length >= 6 && /[A-Z]/.test(password) && /[0-9]/.test(password);

    if (!isStrongPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message:
          'Password must be at least 6 characters, include one uppercase letter and one number.',
      });
    }

    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      });
    }
  });

/**
 * Zod schema for user sign-in validation
 * 
 * Validates:
 * - Email: Must be a valid email format
 * - Password: Must be non-empty
 * 
 * @type {z.ZodObject}
 * @example
 * const result = signInSchema.safeParse({ email, password });
 * if (result.success) {
 *   // Email and password are valid
 * }
 */
export const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().trim().min(1, 'Password is required.'),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;

/**
 * Generic type for field-level validation errors
 * 
 * Maps field names to their corresponding error messages.
 * Used to display validation errors on individual form fields.
 * 
 * @typedef {Object.<string, string>} FieldErrors
 * @example
 * const errors: FieldErrors<SignInFormValues> = {
 *   email: 'Enter a valid email address.',
 *   password: 'Password is required.'
 * }
 */
export type FieldErrors<T extends Record<string, unknown>> = Partial<
  Record<keyof T, string>
>;

/**
 * Utility function to convert Zod validation errors to field-level errors
 * 
 * Transforms a ZodError object into a flat object mapping field names to error messages.
 * Only keeps the first error for each field if multiple validation rules fail.
 * 
 * @template T - The type of the object being validated
 * @param {z.ZodError<T>} error - Zod validation error object
 * @returns {FieldErrors<T>} Object mapping field names to error messages
 * 
 * @example
 * const result = registrationSchema.safeParse(formData);
 * if (!result.success) {
 *   const fieldErrors = getSchemaFieldErrors(result.error);
 *   // { email: 'Enter a valid email address.', password: '...' }
 * }
 */
export const getSchemaFieldErrors = <T extends Record<string, unknown>>(
  error: z.ZodError<T>
): FieldErrors<T> => {
  const mappedErrors: FieldErrors<T> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string') {
      const key = field as keyof T;
      if (!mappedErrors[key]) {
        mappedErrors[key] = issue.message;
      }
    }
  }

  return mappedErrors;
};
