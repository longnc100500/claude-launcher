import { z } from 'zod'

export const ProfileIdSchema = z
  .string()
  .min(1, 'Profile ID cannot be empty')
  .uuid('Profile ID must be a valid UUID')

export const CreateProfileInputSchema = z.object({
  name: z
    .string()
    .min(1, 'Profile name cannot be empty')
    .max(64, 'Profile name must be 64 characters or fewer')
    .trim(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex color like #ff0000').optional(),
  icon: z.string().max(2, 'Icon must be a single emoji').optional(),
})

export const UpdateProfileInputSchema = z.object({
  name: z
    .string()
    .min(1, 'Profile name cannot be empty')
    .max(64, 'Profile name must be 64 characters or fewer')
    .trim()
    .optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex color like #ff0000').optional(),
  icon: z.string().max(2, 'Icon must be a single emoji').optional(),
})

export const ProfileIdParamsSchema = z.object({
  id: ProfileIdSchema,
})

export const LaunchInputSchema = z.object({
  profileId: ProfileIdSchema,
})

export const AppSettingsSchema = z.object({
  claudeBinaryPath: z.string().nullable(),
  dataDir: z.string().min(1, 'Data directory cannot be empty'),
  launchOnStartup: z.boolean(),
})

export const DiskUsageResultSchema = z.object({
  bytes: z.number().nonnegative(),
})

export const CleanupResultSchema = z.object({
  bytesFreed: z.number().nonnegative(),
})

export type CreateProfileInputSchemaType = z.infer<typeof CreateProfileInputSchema>
export type UpdateProfileInputSchemaType = z.infer<typeof UpdateProfileInputSchema>
export type AppSettingsSchemaType = z.infer<typeof AppSettingsSchema>
