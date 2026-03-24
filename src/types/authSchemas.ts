import { z } from 'zod';

/**
 * Minimum age requirement for user registration (in years)
 * @constant {number}
 */
const MINIMUM_AGE = 13;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;
const MAX_USERNAME_LENGTH = 30;

/**
 * Error message shown when user is below minimum age
 * @constant {string}
 */
const MINIMUM_AGE_MESSAGE =
  "Sorry, but you don't meet DeciBel's minimum age requirements";

//array months used in date fix below (probably not the best way for the fix but let's see)
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
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
    email: z
      .string()
      .trim()
      .max(MAX_EMAIL_LENGTH, 'Email is too long.')
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'),
    password: z
      .string()
      .max(
        MAX_PASSWORD_LENGTH,
        `Password must be at most ${MAX_PASSWORD_LENGTH} characters long.`
      )
      .min(6, 'Password must be at least 6 characters long.'),
    confirmPassword: z
      .string()
      .max(
        MAX_PASSWORD_LENGTH,
        `Confirm password must be at most ${MAX_PASSWORD_LENGTH} characters long.`
      )
      .min(1, 'Confirm password is required.'),
    displayName: z
      .string()
      .trim()
      .min(1, 'Display name is required.')
      .max(
        MAX_USERNAME_LENGTH,
        `Display name must be at most ${MAX_USERNAME_LENGTH} characters long.`
      )
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        'Display name can only contain letters, numbers, dots, underscores, and hyphens.'
      ),
    month: z.string().min(1, 'Month is required.'),
    day: z.string().min(1, 'Day is required.'),
    year: z.string().min(1, 'Year is required.'),
    gender: z.string().min(1, 'Gender is required.'),
  })
  .superRefine((values, ctx) => {
    if (values.month && values.day && values.year) {
      //not sure if this is the best way for this fix but will try it for now
      const year = Number(values.year);
      const day = Number(values.day);
      const mIdx = months.indexOf(values.month);

      if (mIdx !== -1 && !Number.isNaN(year) && !Number.isNaN(day)) {
        // Validate max days in month (Handles Leap Years dynamically)
        const daysInMonth = new Date(year, mIdx + 1, 0).getDate();
        if (day > daysInMonth) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['day'],
            message: `Invalid date. ${values.month} only has ${daysInMonth} days.`,
          });
        }

        // Prevent future birthdates
        const inputDate = new Date(year, mIdx, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize time to midnight
        if (inputDate > today) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['year'],
            message: 'Date of birth cannot be in the future.',
          });
        }
      }
    }
    //the date fix ends here
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
    //eslint-disable-next-line no-control-regex
    const hasControlCharacters = /[\u0000-\u001F\u007F]/.test(password);
    const isStrongPassword =
      password.length >= 6 && /[A-Z]/.test(password) && /[0-9]/.test(password);

    if (hasControlCharacters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: 'Password contains invalid characters.',
      });
    }

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
  email: z
    .string()
    .trim()
    .max(MAX_EMAIL_LENGTH, 'Email is too long.')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'),
  password: z
    .string()
    .trim()
    .max(
      MAX_PASSWORD_LENGTH,
      `Password must be at most ${MAX_PASSWORD_LENGTH} characters long.`
    )
    //eslint-disable-next-line no-control-regex
    .regex(/^[^\u0000-\u001F\u007F]*$/, 'Password contains invalid characters.')
    .min(1, 'Password is required.'),
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
