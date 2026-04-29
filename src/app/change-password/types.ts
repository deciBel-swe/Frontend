import { z } from 'zod';

const MAX_PASSWORD_LENGTH = 128;

export const changePasswordFormSchema = z
  .object({
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
    logoutEverywhere: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const password = values.password.trim();
    const confirmPassword = values.confirmPassword.trim();
    // eslint-disable-next-line no-control-regex
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

export type ChangePasswordFormValues = z.infer<
  typeof changePasswordFormSchema
>;

export type ChangePasswordFieldErrors = Partial<
  Record<keyof ChangePasswordFormValues, string>
>;

export const getChangePasswordFieldErrors = (
  error: z.ZodError<ChangePasswordFormValues>
): ChangePasswordFieldErrors => {
  const mappedErrors: ChangePasswordFieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string') {
      const key = field as keyof ChangePasswordFormValues;
      if (!mappedErrors[key]) {
        mappedErrors[key] = issue.message;
      }
    }
  }

  return mappedErrors;
};

export const changePasswordRequestSchema = z.object({
  token: z.string().trim().min(1, 'Missing reset token.'),
  newPassword: z.string().trim().min(1),
  logoutAll: z.boolean().optional(),
});

export const changePasswordResponseSchema = z.object({
  message: z.string().trim().min(1),
});

export type ChangePasswordRequest = z.infer<
  typeof changePasswordRequestSchema
>;

export type ChangePasswordResponse = z.infer<
  typeof changePasswordResponseSchema
>;
