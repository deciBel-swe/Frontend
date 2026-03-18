import { z } from 'zod';

/** DTO returned by GET /users/me/privacy */
export const privacySettingsSchema = z.object({
  isPrivate: z.boolean(),
  showHistory: z.boolean(),
});
export type PrivacySettings = z.infer<typeof privacySettingsSchema>;

/** DTO sent to PATCH /users/me/privacy */
export const updatePrivacySettingsDtoSchema = privacySettingsSchema
  .partial()
  .refine(
    (payload) =>
      payload.isPrivate !== undefined || payload.showHistory !== undefined,
    {
      message: 'At least one privacy setting must be provided.',
    }
  );
export type UpdatePrivacySettingsDto = z.infer<
  typeof updatePrivacySettingsDtoSchema
>;
