/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FSRSMemberState, FSRSRating, FSRSReviewHistory } from "../types";

/**
 * Calculates current Retrievability (R) of a chunk.
 * FSRS formula: R = (1 + t / (9 * S)) ^ -1
 * where t is elapsed days and S is Stability.
 */
export function calculateRetrievability(stability: number, lastReviewedAt: string | null): number {
  if (!lastReviewedAt) return 1.0; // Brand new, fully retrievable
  
  const elapsedMs = Date.now() - new Date(lastReviewedAt).getTime();
  const elapsedDays = Math.max(0, elapsedMs / (1000 * 60 * 60 * 24));
  
  // FSRS formula
  return Math.pow(1 + elapsedDays / (9 * stability), -1);
}

/**
 * Initialize a new FSRS state for a chunk.
 */
export function initializeFSRSState(chunkId: string): FSRSMemberState {
  return {
    chunkId,
    difficulty: 5.0, // Initial medium difficulty
    stability: 1.0, // Initial stability of 1 day
    retrievability: 1.0,
    lastReviewedAt: null,
    scheduledDate: new Date().toISOString().split("T")[0], // Due today
    reviewHistory: []
  };
}

/**
 * Updates the FSRS state based on the user's performance rating.
 * Rating can be: 'again', 'hard', 'good', 'easy'.
 */
export function updateFSRSState(currentState: FSRSMemberState, rating: FSRSRating): FSRSMemberState {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  
  const dBefore = currentState.difficulty;
  const sBefore = currentState.stability;
  
  let dAfter = dBefore;
  let sAfter = sBefore;
  
  // Calculate elapsed days
  let elapsedDays = 0;
  if (currentState.lastReviewedAt) {
    const elapsedMs = now.getTime() - new Date(currentState.lastReviewedAt).getTime();
    elapsedDays = Math.max(0, elapsedMs / (1000 * 60 * 60 * 24));
  }
  
  // FSRS Factor Adjustments
  switch (rating) {
    case "again":
      // Re-learn: increase difficulty, plunge stability
      dAfter = Math.min(10.0, dBefore + 1.5);
      sAfter = Math.max(0.1, sBefore * 0.2); // plunge stability to 20%
      break;
    case "hard":
      // Difficult: slightly increase difficulty, small increase in stability
      dAfter = Math.min(10.0, dBefore + 0.5);
      sAfter = sBefore * 1.2 * Math.exp(-0.1 * dBefore);
      break;
    case "good":
      // Good recall: maintain or slight drop in difficulty, exponential stability growth
      dAfter = Math.max(1.0, dBefore - 0.2);
      sAfter = sBefore * 2.5 * Math.exp(-0.05 * dBefore);
      break;
    case "easy":
      // Easy recall: decrease difficulty, large stability growth
      dAfter = Math.max(1.0, dBefore - 1.0);
      sAfter = sBefore * 4.5 * Math.exp(-0.02 * dBefore);
      break;
  }
  
  // Bound stability logically
  sAfter = Math.max(0.2, Math.min(365, sAfter));
  
  // Calculate next review interval
  const intervalDays = Math.max(1, Math.round(sAfter));
  const scheduledDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
    
  const historyItem: FSRSReviewHistory = {
    timestamp: now.toISOString(),
    rating,
    stabilityBefore: sBefore,
    stabilityAfter: sAfter,
    difficultyBefore: dBefore,
    difficultyAfter: dAfter
  };
  
  return {
    chunkId: currentState.chunkId,
    difficulty: parseFloat(dAfter.toFixed(2)),
    stability: parseFloat(sAfter.toFixed(2)),
    retrievability: calculateRetrievability(sAfter, now.toISOString()),
    lastReviewedAt: now.toISOString(),
    scheduledDate,
    reviewHistory: [...currentState.reviewHistory, historyItem]
  };
}
