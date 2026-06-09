// import { Router } from 'express';
// import { SupabaseClient } from '@supabase/supabase-js';
// import { ExecutionCircleService } from './executioncircle.service.js';
// import { ExecutionCircleController } from './executioncircle.controller.js';
// import verifyUser from '../auth/auth.middleware.js';
// // adjust path to your auth middleware
// console.log("Execution Circle routes loaded");
// export function createExecutionCircleRouter(supabase: SupabaseClient): Router {
//   const router = Router();
//   const service = new ExecutionCircleService(supabase);
//   const controller = new ExecutionCircleController(service);

//   // All routes require authentication
//   router.use(verifyUser);

//   // ── Circle management ──────────────────────────────────
//   // POST   /api/execution-circle/create           → auto-match or create
//   router.post('/create', controller.createOrJoin);

//   // POST   /api/execution-circle/join/:circleId   → explicit join
//   router.post('/join/:circleId', controller.joinCircle);

//   // GET    /api/execution-circle/my               → get current user's circle (must be before /:circleId)
//   router.get('/my', controller.getMyCircle);

//   // GET    /api/execution-circle/:circleId        → get circle detail
//   router.get('/:circleId', controller.getCircle);

//   // GET    /api/execution-circle/:circleId/leaderboard
//   router.get('/:circleId/leaderboard', controller.getLeaderboard);

//   // GET    /api/execution-circle/:circleId/health
//   router.get('/:circleId/health', controller.getHealth);

//   router.get(
//  "/:circleId/insights",
//  controller.getInsights
// );

//   // ── Content ────────────────────────────────────────────
//   // POST   /api/execution-circle/post             → create a post
//   router.post('/post', controller.createPost);

//   // POST   /api/execution-circle/comment          → create a comment
//   router.post('/comment', controller.createComment);

//   // POST   /api/execution-circle/like             → toggle like
//   router.post('/like', controller.toggleLike);

//   // GET    /api/execution-circle/feed             → paginated feed
//   router.get('/feed', controller.getFeed);

//   // ── Challenges ─────────────────────────────────────────
//   // POST   /api/execution-circle/challenge/complete
//   router.post('/challenge/complete', controller.completeChallenge);

//   return router;
// }









// import { Router } from 'express';
// import { SupabaseClient } from '@supabase/supabase-js';
// import { ExecutionCircleService } from './executioncircle.service.js';
// import { ExecutionCircleController } from './executioncircle.controller.js';
// import verifyUser from '../auth/auth.middleware.js';
// // adjust path to your auth middleware
// console.log("Execution Circle routes loaded");

// export function createExecutionCircleRouter(supabase: SupabaseClient): Router {
//   const router = Router();
//   const service = new ExecutionCircleService(supabase);
//   const controller = new ExecutionCircleController(
//     service,
//     supabase
//   );

//   // All routes require authentication
//   router.use(verifyUser);

//   // ── Circle management ──────────────────────────────────
//   // POST   /api/execution-circle/create           → auto-match or create
//   router.post('/create', controller.createOrJoin);

//   // POST   /api/execution-circle/join/:circleId   → explicit join
//   router.post('/join/:circleId', controller.joinCircle);

//   // GET    /api/execution-circle/my               → get current user's circle (must be before /:circleId)
//   router.get('/my', controller.getMyCircle);

//   // GET    /api/execution-circle/:circleId        → get circle detail
//   router.get('/:circleId', controller.getCircle);

//   // GET    /api/execution-circle/:circleId/leaderboard
//   router.get('/:circleId/leaderboard', controller.getLeaderboard);

//   // ADD insights route BEFORE health (as requested)
//   router.get(
//     "/:circleId/insights",
//     controller.getInsights
//   );

//   // GET    /api/execution-circle/:circleId/health
//   router.get('/:circleId/health', controller.getHealth);

//   // ── Content ────────────────────────────────────────────
//   // POST   /api/execution-circle/post             → create a post
//   router.post('/post', controller.createPost);

//   // POST   /api/execution-circle/comment          → create a comment
//   router.post('/comment', controller.createComment);

//   // POST   /api/execution-circle/like             → toggle like
//   router.post('/like', controller.toggleLike);

//   // GET    /api/execution-circle/feed             → paginated feed
//   router.get('/feed', controller.getFeed);

//   // ── Challenges ─────────────────────────────────────────
//   // POST   /api/execution-circle/challenge/complete
//   router.post('/challenge/complete', controller.completeChallenge);

//   return router;
// }




















// import { Router } from 'express';
// import { SupabaseClient } from '@supabase/supabase-js';
// import { ExecutionCircleService } from './executioncircle.service.js';
// import { ExecutionCircleController } from './executioncircle.controller.js';
// import verifyUser from '../auth/auth.middleware.js';

// console.log('Execution Circle routes loaded');

// export function createExecutionCircleRouter(supabase: SupabaseClient): Router {
//   const router = Router();
//   const service = new ExecutionCircleService(supabase);
//   const controller = new ExecutionCircleController(service, supabase);

//   router.use(verifyUser);

//   // ── POST routes ────────────────────────────────────────────
//   router.post('/create', controller.createOrJoin);
//   router.post('/join/:circleId', controller.joinCircle);
//   router.post('/post', controller.createPost);
//   router.post('/comment', controller.createComment);
//   router.post('/like', controller.toggleLike);
//   router.post('/challenge/complete', controller.completeChallenge);
//   router.post('/proof', controller.uploadProof);
//   router.post('/change-request', controller.requestChange);

//   // ── GET static routes (must precede /:circleId) ───────────
//   router.get('/my', controller.getMyCircle);
//   router.get('/feed', controller.getFeed);

//   // ── GET dynamic routes ────────────────────────────────────
//   router.get('/:circleId', controller.getCircle);
//   router.get('/:circleId/leaderboard', controller.getLeaderboard);
//   router.get('/:circleId/insights', controller.getInsights);
//   router.get('/:circleId/health', controller.getHealth);

//   return router;
// }














import { Router } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { ExecutionCircleService } from './executioncircle.service.js';
import { ExecutionCircleController } from './executioncircle.controller.js';
import verifyUser from '../auth/auth.middleware.js';

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
  router.get('/:circleId/health', controller.getHealth);
  router.get('/:circleId/activity', controller.getActivity);   // NEW

  return router;
}