
import { Request, Response, NextFunction } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { ExecutionCircleService } from './executioncircle.service.js';
import {
  CreateCircleSchema,
  CreatePostSchema,
  CreateCommentSchema,
  ToggleLikeSchema,
  FeedQuerySchema,
  UUIDParamSchema,
} from './executioncircle.schema.js';
import { ZodError } from 'zod';
import { CircleInsightsService } from './circle-insights.service.js';

function handleZodError(err: ZodError, res: Response): void {
  res.status(400).json({
    error: 'Validation error',
    details: err.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
  });
}

function getAuthUser(req: Request): string {
  const user = (req as any).user;
  if (!user?.id) throw new Error('Unauthorized');
  return user.id as string;
}

export class ExecutionCircleController {
  private insights: CircleInsightsService;

  constructor(
    private readonly service: ExecutionCircleService,
    private readonly supabase: SupabaseClient,
  ) {
    this.insights = new CircleInsightsService(supabase);
  }

  createOrJoin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUser(req);
      const input = CreateCircleSchema.parse(req.body);
      const result = await this.service.autoMatchCircle(
        userId,
        input.goal,
        input.duration_months,
        input.current_level,
      );
      res.status(result.is_new ? 201 : 200).json(result);
    } catch (err) {
      if (err instanceof ZodError) { handleZodError(err, res); return; }
      next(err);
    }
  };

  joinCircle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUser(req);
      const { circleId } = UUIDParamSchema.parse(req.params);
      const result = await this.service.joinCircle(circleId, userId);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof ZodError) { handleZodError(err, res); return; }
      next(err);
    }
  };

  getCircle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUser(req);
      const { circleId } = UUIDParamSchema.parse(req.params);
      const detail = await this.service.getCircleDetail(circleId, userId);
      res.status(200).json(detail);
    } catch (err) {
      if (err instanceof ZodError) { handleZodError(err, res); return; }
      next(err);
    }
  };

  getMyCircle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUser(req);
      
      const circle = await this.service.getUserCircle(userId);
      if (!circle) { res.status(404).json({ error: 'No circle found' }); return; }
      const detail = await this.service.getCircleDetail(circle.id, userId);
      res.status(200).json(detail);
    } catch (err) {
      next(err);
    }
  };

  createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUser(req);
      const input = CreatePostSchema.parse(req.body);
      const post = await this.service.createPost(input, userId);
      res.status(201).json({ post });
    } catch (err) {
      if (err instanceof ZodError) { handleZodError(err, res); return; }
      next(err);
    }
  };

  createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUser(req);
      const input = CreateCommentSchema.parse(req.body);
      const comment = await this.service.createComment(input, userId);
      res.status(201).json({ comment });
    } catch (err) {
      if (err instanceof ZodError) { handleZodError(err, res); return; }
      next(err);
    }
  };

  toggleLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUser(req);
      const { post_id } = ToggleLikeSchema.parse(req.body);
      const result = await this.service.toggleLike(post_id, userId);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof ZodError) { handleZodError(err, res); return; }
      next(err);
    }
  };

  getFeed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUser(req);
      const query = FeedQuerySchema.parse(req.query);
      let circleId = query.circle_id;
      if (!circleId) {
        const circle = await this.service.getUserCircle(userId);
        if (!circle) { res.status(404).json({ error: 'Join a circle first' }); return; }
        circleId = circle.id;
      }
      const feed = await this.service.getFeed(circleId, userId, query.limit, query.cursor);
      res.status(200).json(feed);
    } catch (err) {
      if (err instanceof ZodError) { handleZodError(err, res); return; }
      next(err);
    }
  };

  getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      getAuthUser(req);
      const { circleId } = UUIDParamSchema.parse(req.params);
      const leaderboard = await this.service.getLeaderboard(circleId);
      res.status(200).json({ leaderboard });
    } catch (err) {
      if (err instanceof ZodError) { handleZodError(err, res); return; }
      next(err);
    }
  };

  completeChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUser(req);
      const { challenge_id } = req.body as { challenge_id: string };
      if (!challenge_id) { res.status(400).json({ error: 'challenge_id required' }); return; }
      await this.service.completeChallenge(challenge_id, userId);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  getInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      getAuthUser(req);
      const { circleId } = UUIDParamSchema.parse(req.params);
      const data = await this.insights.getCircleInsights(circleId);
      res.status(200).json(data);
    } catch (err) {
      if (err instanceof ZodError) { handleZodError(err, res); return; }
      next(err);
    }
  };


  // NEW: Get circle activity feed for sidebar
  getActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      getAuthUser(req);
      const { circleId } = UUIDParamSchema.parse(req.params);
      const activities = await this.service.getCircleActivity(circleId, 10);
      res.status(200).json({ activities });
    } catch (err) {
      if (err instanceof ZodError) { handleZodError(err, res); return; }
      next(err);
    }
  };

  uploadProof = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUser(req);
      const { circle_id, image_url, description } = req.body as {
        circle_id: string;
        image_url: string;
        description: string;
      };
      if (!circle_id || !image_url) {
        res.status(400).json({ error: 'circle_id and image_url are required' });
        return;
      }
      const result = await this.service.uploadProof(
        userId,
        circle_id,
        image_url,
        description || '',
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  requestChange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUser(req);
      const { circle_id, reason } = req.body as { circle_id: string; reason: string };
      if (!circle_id || !reason) {
        res.status(400).json({ error: 'circle_id and reason are required' });
        return;
      }
      const result = await this.service.requestCircleChange(userId, circle_id, reason);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}