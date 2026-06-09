// import {
//   CircleDetail,
//   CirclePostWithAuthor,
//   LeaderboardEntry,
//   FeedResponse,
//   AutoMatchResult,
//   CircleHealthData,
//   CreateCircleRequest,
//   CreatePostRequest,
//   CreateCommentRequest,
//   CircleComment,
//   CirclePost,
// } from '@/types/executioncircle.types.js';

// import { supabase } from '../lib/supabase';

// // const BASE = '/api/execution-circle';

// const BASE = 'http://localhost:5000/api/execution-circle';

// // async function apiFetch<T>(
// //   path: string,
// //   options?: RequestInit,
// // ): Promise<T> {
// //   const res = await fetch(`${BASE}${path}`, {
// //     headers: { 'Content-Type': 'application/json' },
// //     credentials: 'include',
// //     ...options,
// //   });

// //   if (!res.ok) {
// //     const body = await res.json().catch(() => ({}));
// //     throw new Error((body as any)?.error ?? `Request failed: ${res.status}`);
// //   }

// //   return res.json() as Promise<T>;
// // }

// async function apiFetch<T>(
//   path: string,
//   options?: RequestInit,
// ): Promise<T> {

//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   const res = await fetch(`${BASE}${path}`, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${session?.access_token}`,
//       ...(options?.headers || {}),
//     },
//   });

//   if (!res.ok) {
//     const body = await res.json().catch(() => ({}));

//     throw new Error(
//       body?.message ||
//       body?.error ||
//       `Request failed: ${res.status}`
//     );
//   }

//   return res.json();
// }

// // ── Circle management ──────────────────────────────────────

// export async function createOrJoinCircle(
//   input: CreateCircleRequest,
// ): Promise<AutoMatchResult> {
//   return apiFetch<AutoMatchResult>('/create', {
//     method: 'POST',
//     body: JSON.stringify(input),
//   });
// }

// export async function joinCircle(
//   circleId: string,
// ): Promise<{ member: any; circle: any }> {
//   return apiFetch(`/join/${circleId}`, { method: 'POST' });
// }

// export async function getMyCircle(): Promise<CircleDetail> {
//   return apiFetch<CircleDetail>('/my');
// }

// export async function getCircle(circleId: string): Promise<CircleDetail> {
//   return apiFetch<CircleDetail>(`/${circleId}`);
// }

// export async function getLeaderboard(circleId: string): Promise<LeaderboardEntry[]> {
//   const data = await apiFetch<{ leaderboard: LeaderboardEntry[] }>(
//     `/${circleId}/leaderboard`,
//   );
//   return data.leaderboard;
// }

// export async function getCircleHealth(circleId: string): Promise<CircleHealthData> {
//   return apiFetch<CircleHealthData>(`/${circleId}/health`);
// }

// // ── Feed ───────────────────────────────────────────────────

// export async function getFeed(
//   circleId?: string,
//   cursor?: string,
//   limit = 20,
// ): Promise<FeedResponse> {
//   const params = new URLSearchParams();
//   if (circleId) params.set('circle_id', circleId);
//   if (cursor) params.set('cursor', cursor);
//   params.set('limit', String(limit));
//   return apiFetch<FeedResponse>(`/feed?${params.toString()}`);
// }

// // ── Posts ──────────────────────────────────────────────────

// export async function createPost(
//   input: CreatePostRequest,
// ): Promise<{ post: CirclePost }> {
//   return apiFetch('/post', {
//     method: 'POST',
//     body: JSON.stringify(input),
//   });
// }

// export async function createComment(
//   input: CreateCommentRequest,
// ): Promise<{ comment: CircleComment }> {
//   return apiFetch('/comment', {
//     method: 'POST',
//     body: JSON.stringify(input),
//   });
// }

// export async function toggleLike(
//   postId: string,
// ): Promise<{ liked: boolean }> {
//   return apiFetch('/like', {
//     method: 'POST',
//     body: JSON.stringify({ post_id: postId }),
//   });
// }

// // ── Challenges ─────────────────────────────────────────────

// export async function completeChallenge(
//   challengeId: string,
// ): Promise<{ success: boolean }> {
//   return apiFetch('/challenge/complete', {
//     method: 'POST',
//     body: JSON.stringify({ challenge_id: challengeId }),
//   });
// }

// export async function getInsights(
//  circleId: string
// ){
//  return apiFetch(
//    `/${circleId}/insights`
//  );
// }








// import {
//   CircleDetail,
//   CirclePostWithAuthor,
//   LeaderboardEntry,
//   FeedResponse,
//   AutoMatchResult,
//   CircleHealthData,
//   CreateCircleRequest,
//   CreatePostRequest,
//   CreateCommentRequest,
//   CircleComment,
//   CirclePost,
// } from '@/types/executioncircle.types.js';

// import { supabase } from '../lib/supabase';

// const BASE = 'http://localhost:5000/api/execution-circle';

// async function apiFetch<T>(
//   path: string,
//   options?: RequestInit,
// ): Promise<T> {

//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   const res = await fetch(`${BASE}${path}`, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${session?.access_token}`,
//       ...(options?.headers || {}),
//     },
//   });

//   if (!res.ok) {
//     const body = await res.json().catch(() => ({}));

//     throw new Error(
//       (body as any)?.message ||
//       (body as any)?.error ||
//       `Request failed: ${res.status}`
//     );
//   }

//   return res.json();
// }

// // ── Circle management ──────────────────────────────────────

// export async function createOrJoinCircle(
//   input: CreateCircleRequest,
// ): Promise<AutoMatchResult> {
//   return apiFetch<AutoMatchResult>('/create', {
//     method: 'POST',
//     body: JSON.stringify(input),
//   });
// }

// export async function joinCircle(
//   circleId: string,
// ): Promise<{ member: any; circle: any }> {
//   return apiFetch(`/join/${circleId}`, { method: 'POST' });
// }

// export async function getMyCircle(): Promise<CircleDetail> {
//   return apiFetch<CircleDetail>('/my');
// }

// export async function getCircle(circleId: string): Promise<CircleDetail> {
//   return apiFetch<CircleDetail>(`/${circleId}`);
// }

// export async function getLeaderboard(circleId: string): Promise<LeaderboardEntry[]> {
//   const data = await apiFetch<{ leaderboard: LeaderboardEntry[] }>(
//     `/${circleId}/leaderboard`,
//   );
//   return data.leaderboard;
// }

// export async function getCircleHealth(circleId: string): Promise<CircleHealthData> {
//   return apiFetch<CircleHealthData>(`/${circleId}/health`);
// }

// // ── Feed ───────────────────────────────────────────────────

// export async function getFeed(
//   circleId?: string,
//   cursor?: string,
//   limit = 20,
// ): Promise<FeedResponse> {
//   const params = new URLSearchParams();
//   if (circleId) params.set('circle_id', circleId);
//   if (cursor) params.set('cursor', cursor);
//   params.set('limit', String(limit));
//   return apiFetch<FeedResponse>(`/feed?${params.toString()}`);
// }

// // ── Posts ──────────────────────────────────────────────────

// export async function createPost(
//   input: CreatePostRequest,
// ): Promise<{ post: CirclePost }> {
//   return apiFetch('/post', {
//     method: 'POST',
//     body: JSON.stringify(input),
//   });
// }

// export async function createComment(
//   input: CreateCommentRequest,
// ): Promise<{ comment: CircleComment }> {
//   return apiFetch('/comment', {
//     method: 'POST',
//     body: JSON.stringify(input),
//   });
// }

// export async function toggleLike(
//   postId: string,
// ): Promise<{ liked: boolean }> {
//   return apiFetch('/like', {
//     method: 'POST',
//     body: JSON.stringify({ post_id: postId }),
//   });
// }

// // ── Challenges ─────────────────────────────────────────────

// export async function completeChallenge(
//   challengeId: string,
// ): Promise<{ success: boolean }> {
//   return apiFetch('/challenge/complete', {
//     method: 'POST',
//     body: JSON.stringify({ challenge_id: challengeId }),
//   });
// }

// export async function getInsights(
//   circleId: string
// ) {
//   return apiFetch(
//     `/${circleId}/insights`
//   );


  
// }















// import {
//   CircleDetail,
//   CirclePostWithAuthor,
//   LeaderboardEntry,
//   FeedResponse,
//   AutoMatchResult,
//   CircleHealthData,
//   CreateCircleRequest,
//   CreatePostRequest,
//   CreateCommentRequest,
//   CircleComment,
//   CirclePost,
// } from '@/types/executioncircle.types.js';

// import { supabase } from '../lib/supabase';

// const BASE = 'http://localhost:5000/api/execution-circle';

// async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   const res = await fetch(`${BASE}${path}`, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${session?.access_token}`,
//       ...(options?.headers || {}),
//     },
//   });

//   if (!res.ok) {
//     const body = await res.json().catch(() => ({}));
//     throw new Error(
//       (body as any)?.message || (body as any)?.error || `Request failed: ${res.status}`,
//     );
//   }

//   return res.json();
// }

// // ── Circle management ──────────────────────────────────────

// export async function createOrJoinCircle(input: CreateCircleRequest): Promise<AutoMatchResult> {
//   return apiFetch<AutoMatchResult>('/create', {
//     method: 'POST',
//     body: JSON.stringify(input),
//   });
// }

// export async function joinCircle(circleId: string): Promise<{ member: any; circle: any }> {
//   return apiFetch(`/join/${circleId}`, { method: 'POST' });
// }

// export async function getMyCircle(): Promise<CircleDetail> {
//   return apiFetch<CircleDetail>('/my');
// }

// export async function getCircle(circleId: string): Promise<CircleDetail> {
//   return apiFetch<CircleDetail>(`/${circleId}`);
// }

// export async function getLeaderboard(circleId: string): Promise<LeaderboardEntry[]> {
//   const data = await apiFetch<{ leaderboard: LeaderboardEntry[] }>(
//     `/${circleId}/leaderboard`,
//   );
//   return data.leaderboard;
// }

// export async function getCircleHealth(circleId: string): Promise<CircleHealthData> {
//   return apiFetch<CircleHealthData>(`/${circleId}/health`);
// }

// // ── Feed ───────────────────────────────────────────────────

// export async function getFeed(
//   circleId?: string,
//   cursor?: string,
//   limit = 20,
// ): Promise<FeedResponse> {
//   const params = new URLSearchParams();
//   if (circleId) params.set('circle_id', circleId);
//   if (cursor) params.set('cursor', cursor);
//   params.set('limit', String(limit));
//   return apiFetch<FeedResponse>(`/feed?${params.toString()}`);
// }

// // ── Posts ──────────────────────────────────────────────────

// export async function createPost(input: CreatePostRequest): Promise<{ post: CirclePost }> {
//   return apiFetch('/post', {
//     method: 'POST',
//     body: JSON.stringify(input),
//   });
// }

// export async function createComment(
//   input: CreateCommentRequest,
// ): Promise<{ comment: CircleComment }> {
//   return apiFetch('/comment', {
//     method: 'POST',
//     body: JSON.stringify(input),
//   });
// }

// export async function toggleLike(postId: string): Promise<{ liked: boolean }> {
//   return apiFetch('/like', {
//     method: 'POST',
//     body: JSON.stringify({ post_id: postId }),
//   });
// }

// // ── Challenges ─────────────────────────────────────────────

// export async function completeChallenge(challengeId: string): Promise<{ success: boolean }> {
//   return apiFetch('/challenge/complete', {
//     method: 'POST',
//     body: JSON.stringify({ challenge_id: challengeId }),
//   });
// }

// // ── Insights ───────────────────────────────────────────────

// export async function getInsights(circleId: string) {
//   return apiFetch(`/${circleId}/insights`);
// }

// // ── Feature 2: Proof Upload ────────────────────────────────

// export async function uploadProof(
//   circleId: string,
//   imageUrl: string,
//   description: string,
// ): Promise<any> {
//   return apiFetch('/proof', {
//     method: 'POST',
//     body: JSON.stringify({ circle_id: circleId, image_url: imageUrl, description }),
//   });
// }

// // ── Feature 7: Request Circle Change ──────────────────────

// export async function requestChange(
//   circleId: string,
//   reason: string,
// ): Promise<{ success: boolean }> {
//   return apiFetch('/change-request', {
//     method: 'POST',
//     body: JSON.stringify({ circle_id: circleId, reason }),
//   });
// }








import {
  CircleDetail,
  CirclePostWithAuthor,
  LeaderboardEntry,
  FeedResponse,
  AutoMatchResult,
  CircleHealthData,
  CreateCircleRequest,
  CreatePostRequest,
  CreateCommentRequest,
  CircleComment,
  CirclePost,
  CircleActivityWithProfile,
} from '@/types/executioncircle.types';

import { supabase } from '../lib/supabase';

const BASE = 'http://localhost:5000/api/execution-circle';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as any)?.message || (body as any)?.error || `Request failed: ${res.status}`,
    );
  }

  return res.json();
}

export async function createOrJoinCircle(input: CreateCircleRequest): Promise<AutoMatchResult> {
  return apiFetch<AutoMatchResult>('/create', { method: 'POST', body: JSON.stringify(input) });
}

export async function joinCircle(circleId: string): Promise<{ member: any; circle: any }> {
  return apiFetch(`/join/${circleId}`, { method: 'POST' });
}

export async function getMyCircle(): Promise<CircleDetail> {
  return apiFetch<CircleDetail>('/my');
}

export async function getCircle(circleId: string): Promise<CircleDetail> {
  return apiFetch<CircleDetail>(`/${circleId}`);
}

export async function getLeaderboard(circleId: string): Promise<LeaderboardEntry[]> {
  const data = await apiFetch<{ leaderboard: LeaderboardEntry[] }>(`/${circleId}/leaderboard`);
  return data.leaderboard;
}

export async function getCircleHealth(circleId: string): Promise<CircleHealthData> {
  return apiFetch<CircleHealthData>(`/${circleId}/health`);
}

export async function getFeed(
  circleId?: string,
  cursor?: string,
  limit = 20,
): Promise<FeedResponse> {
  const params = new URLSearchParams();
  if (circleId) params.set('circle_id', circleId);
  if (cursor) params.set('cursor', cursor);
  params.set('limit', String(limit));
  return apiFetch<FeedResponse>(`/feed?${params.toString()}`);
}

export async function createPost(input: CreatePostRequest): Promise<{ post: CirclePost }> {
  return apiFetch('/post', { method: 'POST', body: JSON.stringify(input) });
}

export async function createComment(
  input: CreateCommentRequest,
): Promise<{ comment: CircleComment }> {
  return apiFetch('/comment', { method: 'POST', body: JSON.stringify(input) });
}

// FIXED: returns liked + likes_count for optimistic UI
export async function toggleLike(
  postId: string,
): Promise<{ liked: boolean; likes_count: number }> {
  return apiFetch('/like', { method: 'POST', body: JSON.stringify({ post_id: postId }) });
}

export async function completeChallenge(challengeId: string): Promise<{ success: boolean }> {
  return apiFetch('/challenge/complete', {
    method: 'POST',
    body: JSON.stringify({ challenge_id: challengeId }),
  });
}

export async function getInsights(circleId: string) {
  return apiFetch(`/${circleId}/insights`);
}

export async function uploadProof(
  circleId: string,
  imageUrl: string,
  description: string,
): Promise<any> {
  return apiFetch('/proof', {
    method: 'POST',
    body: JSON.stringify({ circle_id: circleId, image_url: imageUrl, description }),
  });
}

export async function requestChange(
  circleId: string,
  reason: string,
): Promise<{ success: boolean }> {
  return apiFetch('/change-request', {
    method: 'POST',
    body: JSON.stringify({ circle_id: circleId, reason }),
  });
}

// NEW: Fetch real circle activity for sidebar
export async function getCircleActivity(
  circleId: string,
): Promise<CircleActivityWithProfile[]> {
  const data = await apiFetch<{ activities: CircleActivityWithProfile[] }>(
    `/${circleId}/activity`,
  );
  return data.activities;
}