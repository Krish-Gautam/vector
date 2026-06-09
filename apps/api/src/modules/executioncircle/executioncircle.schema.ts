import { z } from 'zod';

// ── Shared enums ────────────────────────────────────────────

export const CircleLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);
export const PostTypeSchema = z.enum(['update', 'win', 'challenge', 'question']);

// ── Request schemas ─────────────────────────────────────────

export const CreateCircleSchema = z.object({
  goal: z.string().min(3, 'Goal must be at least 3 characters').max(200),
  duration_months: z
    .number()
    .int()
    .min(1, 'Duration must be at least 1 month')
    .max(24, 'Duration cannot exceed 24 months'),
  current_level: CircleLevelSchema,
});
export type CreateCircleInput = z.infer<typeof CreateCircleSchema>;

export const CreatePostSchema = z.object({
  circle_id: z.string().uuid('Invalid circle ID'),
  content: z.string().min(1, 'Post cannot be empty').max(2000),
  post_type: PostTypeSchema,
});
export type CreatePostInput = z.infer<typeof CreatePostSchema>;

export const CreateCommentSchema = z.object({
  post_id: z.string().uuid('Invalid post ID'),
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

export const ToggleLikeSchema = z.object({
  post_id: z.string().uuid('Invalid post ID'),
});
export type ToggleLikeInput = z.infer<typeof ToggleLikeSchema>;

export const FeedQuerySchema = z.object({
  circle_id: z.string().uuid('Invalid circle ID').optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type FeedQueryInput = z.infer<typeof FeedQuerySchema>;

export const UUIDParamSchema = z.object({
  circleId: z.string().uuid('Invalid circle ID'),
});