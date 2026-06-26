import { Router } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { ExecutionCircleService } from './executioncircle.service.js';
import { ExecutionCircleController } from './executioncircle.controller.js';
import { verifyUser } from '../auth/auth.middleware.js';

export function createExecutionCircleRouter(supabase: SupabaseClient): Router {
  const router = Router();
  const service = new ExecutionCircleService(supabase);
  const controller = new ExecutionCircleController(service, supabase);

  router.use(verifyUser);

  // ── POST routes ───────────────────────────────────────────
  router.post('/create', controller.createOrJoin);
  router.post('/join/:circleId', controller.joinCircle);
  router.post('/post', controller.createPost);
  router.post('/comment', controller.createComment);
  router.post('/like', controller.toggleLike);
  router.post('/challenge/complete', controller.completeChallenge);
  router.post('/proof', controller.uploadProof);
  router.post('/change-request', controller.requestChange);

  // ── GET static (before /:circleId) ───────────────────────
  router.get('/my', controller.getMyCircle);
  router.get('/feed', controller.getFeed);

  // ── GET dynamic ──────────────────────────────────────────
  router.get('/:circleId', controller.getCircle);
  router.get('/:circleId/leaderboard', controller.getLeaderboard);
  router.get('/:circleId/insights', controller.getInsights);
  router.get('/:circleId/activity', controller.getActivity);   // NEW

  return router;
}