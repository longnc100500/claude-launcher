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

export const SessionsListProjectsInputSchema = z.object({
  sourceProfileId: ProfileIdSchema,
})

export const SessionsListFilesInputSchema = z.object({
  sourceProfileId: ProfileIdSchema,
  projectId: z.string().min(1),
})

export const SyncSessionsInputSchema = z.object({
  sourceProfileId: ProfileIdSchema,
  sessionFiles: z.array(z.object({
    projectId: z.string().min(1),
    sessionId: z.string().min(1),
  })).min(1),
  targetProfileIds: z.array(ProfileIdSchema).min(1, 'At least one target profile is required'),
})

export type CreateProfileInputSchemaType = z.infer<typeof CreateProfileInputSchema>
export type UpdateProfileInputSchemaType = z.infer<typeof UpdateProfileInputSchema>
export type AppSettingsSchemaType = z.infer<typeof AppSettingsSchema>
export type SessionsListProjectsInputSchemaType = z.infer<typeof SessionsListProjectsInputSchema>
export type SessionsListFilesInputSchemaType = z.infer<typeof SessionsListFilesInputSchema>
export type SyncSessionsInputSchemaType = z.infer<typeof SyncSessionsInputSchema>
