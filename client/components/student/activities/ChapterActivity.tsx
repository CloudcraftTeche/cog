"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { ArrowLeft, CheckCircle2, Gamepad2, Loader2 } from "lucide-react";
import { useCompleteChapter } from "@/hooks/student/useChapters";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { OfflineHint } from "@/components/shared/pwa/OfflineHint";
import type {
  ActivityConfig,
  ActivityResult,
  ChapterActivityConfig,
} from "@/types/student/activity.types";
import { ScrambleGame } from "./ScrambleGame";
import { MatchingGame } from "./MatchingGame";
import { ColoringGame } from "./ColoringGame";

interface Props {
  chapterId: string;
  config: ChapterActivityConfig;
  onBack: () => void;
}

function ActivityEngine({
  config,
  onComplete,
}: {
  config: ActivityConfig;
  onComplete: (result: ActivityResult) => void;
}) {
  if (config.type === "scramble")
    return <ScrambleGame config={config} onComplete={onComplete} />;
  if (config.type === "matching")
    return <MatchingGame config={config} onComplete={onComplete} />;
  return <ColoringGame config={config} onComplete={onComplete} />;
}

export function ChapterActivity({ chapterId, config, onBack }: Props) {
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<ActivityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // A finished activity that could not be saved because the connection dropped, kept so the
  // student can send it again instead of replaying the whole activity.
  const [unsavedResult, setUnsavedResult] = useState<ActivityResult | null>(null);
  const completeMutation = useCompleteChapter();
  const isOnline = useOnlineStatus();
  const complete = async (activityResult: ActivityResult) => {
    setResult(activityResult);
    setError(null);
    setUnsavedResult(null);
    try {
      await completeMutation.mutateAsync({
        chapterId,
        activityId: config.id,
        answers: activityResult.answers,
      });
    } catch (completionError) {
      setResult(null);
      if (isAxiosError(completionError) && !completionError.response) {
        setUnsavedResult(activityResult);
      }
      setError(
        completionError instanceof Error
          ? completionError.message
          : "Unable to save your result. Please try again.",
      );
    }
  };
  if (result?.completed && !completeMutation.isPending)
    return (
      <section className="rounded-3xl bg-emerald-50 p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto mb-3 text-emerald-600" size={56} />
        <h2 className="text-2xl font-black text-emerald-900">
          Activity complete!
        </h2>
        <p className="mt-2 text-emerald-800">
          You got {result.score} out of {result.total}.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 min-h-14 w-full rounded-2xl bg-emerald-600 px-5 font-bold text-white"
        >
          View Chapter
        </button>
      </section>
    );
  return (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-sky-50 p-4">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-slate-700"
          aria-label="Back to chapter"
        >
          <ArrowLeft />
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            Interactive Activity
          </p>
          <h2 className="text-xl font-black text-slate-900">{config.title}</h2>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-2xl bg-rose-100 p-3 text-center font-bold text-rose-800"
          >
            {error}
          </p>
        )}
        {!started ? (
          <div className="py-5 text-center">
            <Gamepad2 className="mx-auto mb-4 text-sky-500" size={64} />
            <p className="text-lg text-slate-700">{config.description}</p>
            <button
              type="button"
              onClick={() => setStarted(true)}
              disabled={!isOnline}
              className="mt-6 min-h-14 w-full rounded-2xl bg-sky-600 px-5 text-lg font-black text-white shadow-sm disabled:opacity-50"
            >
              Start Activity
            </button>
            <OfflineHint className="mt-3 justify-center" />
          </div>
        ) : completeMutation.isPending ? (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto animate-spin text-sky-600" size={44} />
            <p className="mt-3 font-bold text-slate-700">
              Saving your result...
            </p>
          </div>
        ) : unsavedResult ? (
          <div className="py-5 text-center">
            <p className="text-lg text-slate-700">
              Your answers are still here. Save them when you&apos;re connected.
            </p>
            <button
              type="button"
              onClick={() => complete(unsavedResult)}
              disabled={!isOnline}
              className="mt-6 min-h-14 w-full rounded-2xl bg-sky-600 px-5 text-lg font-black text-white shadow-sm disabled:opacity-50"
            >
              Try Again
            </button>
            <OfflineHint className="mt-3 justify-center" />
          </div>
        ) : (
          <ActivityEngine config={config.activity} onComplete={complete} />
        )}
      </div>
    </section>
  );
}
