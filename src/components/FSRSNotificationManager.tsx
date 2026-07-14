/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SemanticChunk, FSRSMemberState } from "../types";
import { calculateRetrievability } from "../utils/fsrs";
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  Settings, 
  Activity 
} from "lucide-react";
import { motion } from "motion/react";

interface FSRSNotificationManagerProps {
  chunks: SemanticChunk[];
  fsrsStates: Record<string, FSRSMemberState>;
  onStartReview: () => void;
}

export default function FSRSNotificationManager({
  chunks,
  fsrsStates,
  onStartReview,
}: FSRSNotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [nudgeEnabled, setNudgeEnabled] = useState<boolean>(true);
  const [lastNudgeTime, setLastNudgeTime] = useState<string | null>(null);
  const [inIframe, setInIframe] = useState<boolean>(false);

  // Check initial permission & iframe state
  useEffect(() => {
    if (typeof window !== "undefined") {
      setInIframe(window.self !== window.top);
      if ("Notification" in window) {
        setPermission(Notification.permission);
      }
    }

    const savedNudgeSetting = localStorage.getItem("fsrs_nudge_enabled");
    if (savedNudgeSetting !== null) {
      setNudgeEnabled(savedNudgeSetting === "true");
    }

    const savedLastNudge = localStorage.getItem("fsrs_last_nudge_time");
    if (savedLastNudge) {
      setLastNudgeTime(savedLastNudge);
    }
  }, []);

  // Compute Spaced Repetition Health index
  const todayStr = new Date().toISOString().split("T")[0];
  
  const reviewedStates = Object.values(fsrsStates).filter((s) => s.lastReviewedAt !== null);
  
  const dueRevisionCount = chunks.filter((c) => {
    const s = fsrsStates[c.id];
    return s && s.lastReviewedAt && s.scheduledDate <= todayStr;
  }).length;

  const avgRetrievability = reviewedStates.length > 0
    ? reviewedStates.reduce((acc, s) => acc + calculateRetrievability(s.stability, s.lastReviewedAt), 0) / reviewedStates.length
    : 1.0;

  const isBehind = dueRevisionCount > 0 || avgRetrievability < 0.75;

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
    } catch (err) {
      console.warn("Notification request failed or blocked by iframe security sandbox:", err);
      // For sandbox / iframe environments, fallback gracefully
      setPermission("denied");
    }
  };

  const toggleNudge = (val: boolean) => {
    setNudgeEnabled(val);
    localStorage.setItem("fsrs_nudge_enabled", String(val));
  };

  const triggerNotification = (title: string, message: string) => {
    if ("Notification" in window && Notification.permission === "granted" && nudgeEnabled) {
      try {
        const n = new Notification(title, {
          body: message,
          icon: "https://alquran.cloud/assets/images/logo.png", // stable external logo or relative image
          tag: "fsrs-recall-nudge",
          requireInteraction: false,
        });

        n.onclick = () => {
          window.focus();
          onStartReview();
        };

        const nowStr = new Date().toLocaleTimeString();
        setLastNudgeTime(nowStr);
        localStorage.setItem("fsrs_last_nudge_time", nowStr);
      } catch (e) {
        console.error("Failed to construct Notification. This can happen in sandboxed iframes.", e);
      }
    }
  };

  // Perform notification check on mount or when states change
  useEffect(() => {
    if (isBehind && nudgeEnabled && permission === "granted") {
      // Limit automatic notification on mount to prevent spamming
      const lastNudgeDate = localStorage.getItem("fsrs_last_nudge_date");
      const todayDate = new Date().toDateString();

      if (lastNudgeDate !== todayDate) {
        triggerNotification(
          "FSRS Memorization Nudge",
          `Assalamu Alaikum! Your active retention is decaying (${Math.round(avgRetrievability * 100)}%). You have ${dueRevisionCount} chunks due for revision.`
        );
        localStorage.setItem("fsrs_last_nudge_date", todayDate);
      }
    }
  }, [isBehind, nudgeEnabled, permission, dueRevisionCount, avgRetrievability]);

  const handleTestNudge = () => {
    if (permission !== "granted") {
      requestPermission();
    }
    triggerNotification(
      "Test Recitation Reminder",
      `Alhamdulillah, notifications are configured! You have ${dueRevisionCount} FSRS memorization tasks waiting for your active recall today.`
    );
  };

  return (
    <div id="fsrs-notification-panel" className="bg-[#FCF9F2] border border-[#EAE3D2] rounded-3xl p-5 mb-6 text-[#2D4232] font-sans shadow-sm">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 pb-3 border-b border-[#EAE3D2]">
        <div>
          <span className="text-[9px] uppercase font-mono text-[#8A7D63] tracking-widest font-bold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-[#BFA780]" /> SCHEDULE HEALTH INDEX
          </span>
          <h3 className="text-sm font-serif font-semibold text-[#1A2E1F] mt-1">
            Active Spaced Repetition Reminders
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5A6357]">Desktop Alerts:</span>
          <div className="inline-flex rounded-lg border border-[#EAE3D2] p-0.5 bg-white text-[10px]">
            <button
              onClick={() => toggleNudge(true)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                nudgeEnabled ? "bg-[#2D4232] text-white" : "text-[#5A6357] hover:text-[#2D4232]"
              }`}
            >
              Enabled
            </button>
            <button
              onClick={() => toggleNudge(false)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                !nudgeEnabled ? "bg-red-750 text-white" : "text-[#5A6357] hover:text-red-750"
              }`}
            >
              Muted
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left Side: Performance Metrics */}
        <div className="md:col-span-4 bg-white p-4.5 rounded-2xl border border-[#EAE3D2] flex flex-col justify-between shadow-inner">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-[#8A7D63] font-mono block uppercase">Memory Health</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`text-2xl font-mono font-bold ${avgRetrievability >= 0.85 ? "text-[#2D4232]" : avgRetrievability >= 0.7 ? "text-[#BFA780]" : "text-red-700"}`}>
                  {Math.round(avgRetrievability * 100)}%
                </span>
                <span className="text-xs text-[#8A7D63]">retention rate</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#8A7D63] font-mono block uppercase">Revision Backlog</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-mono font-bold text-[#1A2E1F]">
                  {dueRevisionCount}
                </span>
                <span className="text-xs text-[#5A6357]">chunks overdue</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EAE3D2]">
            <div className="flex items-center gap-1 text-[10px]">
              {isBehind ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-amber-800 font-semibold">Falling behind schedule</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-800 font-semibold">All caught up!</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center Side: Notification Control & Permission State */}
        <div className="md:col-span-8 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#1A2E1F]">
              Classic Desktop Notification Integration
            </h4>
            <p className="text-xs text-[#5A6357] leading-relaxed">
              Spaced repetition schedule accuracy relies on consistent micro-reviews. We use the browser's native Notification API to dispatch gentle reminders directly to your system when memory cards are due.
            </p>

            {inIframe && (
              <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded-xl flex items-start gap-2 text-[11px] text-amber-850 mt-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold leading-none">Running inside preview frame</p>
                  <p className="leading-relaxed text-[10px]">
                    To receive actual desktop popups, click <strong>"Open in New Tab"</strong> at the top right of your screen. This bypasses the iframe's security policies. Our high-contrast in-app alert banner will remain active here as a fallback!
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-2 bg-white p-3.5 rounded-2xl border border-[#EAE3D2]">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                permission === "granted" ? "bg-emerald-500 animate-pulse" : permission === "denied" ? "bg-red-500" : "bg-amber-500"
              }`} />
              <span className="text-xs font-mono">
                Permission: <strong className="uppercase">{permission}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {permission !== "granted" && (
                <button
                  onClick={requestPermission}
                  className="bg-white hover:bg-[#FCF9F2] border border-[#EAE3D2] text-[#2D4232] font-semibold py-1.5 px-3 rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5 text-[#BFA780]" />
                  Request Permission
                </button>
              )}

              <button
                onClick={handleTestNudge}
                className="bg-[#2D4232] hover:bg-[#1A2E1F] text-[#FCF9F2] font-semibold py-1.5 px-3 rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                Test Live Nudge
              </button>
            </div>
          </div>

          {lastNudgeTime && (
            <div className="text-[10px] text-[#8A7D63] font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#BFA780]" />
              <span>Last notification broadcasted today at: <strong>{lastNudgeTime}</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact banner component to render at the top of the main layout
interface NotificationBannerProps {
  chunks: SemanticChunk[];
  fsrsStates: Record<string, FSRSMemberState>;
  onStartReview: () => void;
}

export function FSRSOffScheduleBanner({
  chunks,
  fsrsStates,
  onStartReview,
}: NotificationBannerProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const dueRevisionCount = chunks.filter((c) => {
    const s = fsrsStates[c.id];
    return s && s.lastReviewedAt && s.scheduledDate <= todayStr;
  }).length;

  const reviewedStates = Object.values(fsrsStates).filter((s) => s.lastReviewedAt !== null);
  const avgRetrievability = reviewedStates.length > 0
    ? reviewedStates.reduce((acc, s) => acc + calculateRetrievability(s.stability, s.lastReviewedAt), 0) / reviewedStates.length
    : 1.0;

  const isBehind = dueRevisionCount > 0 || avgRetrievability < 0.75;

  if (!isBehind) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      className="bg-amber-50 border-b border-amber-200 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 font-sans">
        <div className="flex items-center gap-2 text-xs text-amber-850">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>FSRS Memory Nudge:</strong> Your estimated Quranic retention is decaying (
            <strong className="text-amber-900">{Math.round(avgRetrievability * 100)}%</strong>). You have{" "}
            <strong className="text-amber-900">{dueRevisionCount}</strong> semantic chunks due for revision.
          </span>
        </div>
        <button
          onClick={onStartReview}
          className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 px-3 rounded-full text-[11px] transition-all shadow-sm flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Review Overdue Now
        </button>
      </div>
    </motion.div>
  );
}

// Add ShieldAlert icon manually if not standard
import { AlertTriangle as ShieldAlert } from "lucide-react";
