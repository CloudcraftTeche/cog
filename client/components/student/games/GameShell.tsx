"use client";

import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { CheckCircle2, Gamepad2, Loader2, RotateCcw, Star, Volume2, VolumeX } from "lucide-react";
import { useCheckGameAnswer, useSubmitGame } from "@/hooks/student/useChapterGames";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { OfflineHint } from "@/components/shared/pwa/OfflineHint";
import type { CheckResult, GameAnswers, GameResult, PlayableGame } from "@/types/student/game.types";
import { isGameSoundOn, playGameSound, setGameSoundOn, type GameSound } from "@/utils/student/gameSounds";
import { getGamePlugin } from "./registry";
import { ReadAloudButton } from "./primitives/ReadAloudButton";

type Phase = "intro" | "playing" | "saving" | "done" | "unsaved";

interface Props {
  chapterId: string;
  game: PlayableGame;
  position: number;
  count: number;
  onChapterCompleted?: () => void;
  // Staff preview (LOGOS-77) passes its own check/submit so nothing is saved to student progress.
  checkAnswer?: (itemId: string, answer: string) => Promise<CheckResult>;
  submitAnswers?: (answers: GameAnswers) => Promise<{ score: number; total: number; chapterCompleted?: boolean }>;
}

// Finishing a game passes it; stars only show how many answers were right.
export const starsFor = ({ score, total }: GameResult) => {
  const ratio = total ? score / total : 0;
  return ratio === 1 ? 3 : ratio >= 0.6 ? 2 : 1;
};

const errorMessage = (error: unknown) =>
  isAxiosError(error)
    ? (error.response?.data as { message?: string } | undefined)?.message ?? "Unable to save your result. Please try again."
    : error instanceof Error
      ? error.message
      : "Unable to save your result. Please try again.";

export function GameShell({ chapterId, game, position, count, onChapterCompleted, checkAnswer, submitAnswers }: Props) {
  const plugin = getGamePlugin(game.type);
  const isOnline = useOnlineStatus();
  const checkMutation = useCheckGameAnswer();
  const submitMutation = useSubmitGame(chapterId);
  const [phase, setPhase] = useState<Phase>(game.result ? "done" : "intro");
  const [result, setResult] = useState<GameResult | null>(game.result);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [round, setRound] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [unsaved, setUnsaved] = useState<GameAnswers | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => setSoundOn(isGameSoundOn()), []);

  const playSound = useCallback((sound: GameSound) => playGameSound(sound, soundOn), [soundOn]);
  const reportProgress = useCallback((done: number, total: number) => setProgress({ done, total }), []);

  const check = useCallback(
    async (itemId: string, answer: string) => {
      try {
        const result = checkAnswer
          ? await checkAnswer(itemId, answer)
          : await checkMutation.mutateAsync({ gameId: game._id, itemId, answer });
        playSound(result.correct ? "correct" : "wrong");
        setError(null);
        return result;
      } catch (checkError) {
        setError(isAxiosError(checkError) && !checkError.response ? "No connection. Your answer was not checked." : errorMessage(checkError));
        return { correct: false, explanation: null };
      }
    },
    [checkAnswer, checkMutation, game._id, playSound]
  );

  const submit = async (answers: GameAnswers) => {
    setPhase("saving");
    setError(null);
    try {
      const saved = submitAnswers
        ? await submitAnswers(answers)
        : await submitMutation.mutateAsync({ gameId: game._id, answers });
      setResult({ score: saved.score, total: saved.total });
      setUnsaved(null);
      setPhase("done");
      playSound("celebrate");
      if (saved.chapterCompleted) onChapterCompleted?.();
    } catch (submitError) {
      setError(errorMessage(submitError));
      if (isAxiosError(submitError) && !submitError.response) {
        // Keep the finished answers so the child can save them once back online, without replaying.
        setUnsaved(answers);
        setPhase("unsaved");
      } else {
        setPhase("playing");
      }
    }
  };

  const playAgain = () => {
    setRound((value) => value + 1);
    setProgress({ done: 0, total: 0 });
    setError(null);
    setPhase("playing");
  };

  const toggleSound = () => {
    setSoundOn((on) => {
      setGameSoundOn(!on);
      return !on;
    });
  };

  const validConfig = plugin?.isValidConfig(game.config) ?? false;
  const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  const stars = result ? starsFor(result) : 0;

  return (
    <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-sky-50 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            Game {position} of {count}
            {plugin ? ` · ${plugin.label}` : ""}
          </p>
          <h2 className="text-xl font-black text-slate-900">{game.title}</h2>
        </div>
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
          aria-pressed={soundOn}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-slate-600"
        >
          {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {phase === "playing" && progress.total > 0 && (
        <div className="h-2 bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <div className="h-full bg-emerald-400 transition-all motion-reduce:transition-none" style={{ width: `${percent}%` }} />
        </div>
      )}

      <div className="p-4 sm:p-6">
        {error && (
          <p role="alert" className="mb-4 rounded-2xl bg-rose-100 p-3 text-center font-bold text-rose-800">
            {error}
          </p>
        )}

        {!plugin || !validConfig ? (
          <p className="py-6 text-center text-slate-600">This game is not ready yet. Please ask your teacher.</p>
        ) : phase === "intro" ? (
          <div className="py-5 text-center">
            <Gamepad2 className="mx-auto mb-4 text-sky-500" size={64} />
            {game.instructions && (
              <div className="flex items-center justify-center gap-3">
                <p className="text-lg text-slate-700">{game.instructions}</p>
                <ReadAloudButton text={game.instructions} label="Read the instructions aloud" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setPhase("playing")}
              disabled={!isOnline}
              className="mt-6 min-h-14 w-full rounded-2xl bg-sky-600 px-5 text-lg font-black text-white shadow-sm disabled:opacity-50"
            >
              Start Game
            </button>
            <OfflineHint className="mt-3 justify-center" />
          </div>
        ) : phase === "playing" ? (
          <plugin.Component
            key={round}
            config={game.config}
            check={check}
            finish={submit}
            reportProgress={reportProgress}
            playSound={playSound}
            disabled={!isOnline}
          />
        ) : phase === "saving" ? (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto animate-spin text-sky-600" size={44} />
            <p className="mt-3 font-bold text-slate-700">Saving your result...</p>
          </div>
        ) : phase === "unsaved" && unsaved ? (
          <div className="py-5 text-center">
            <p className="text-lg text-slate-700">Your answers are still here. Save them when you&apos;re connected.</p>
            <button
              type="button"
              onClick={() => submit(unsaved)}
              disabled={!isOnline}
              className="mt-6 min-h-14 w-full rounded-2xl bg-sky-600 px-5 text-lg font-black text-white shadow-sm disabled:opacity-50"
            >
              Try Again
            </button>
            <OfflineHint className="mt-3 justify-center" />
          </div>
        ) : result ? (
          <div className="relative py-5 text-center">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-6 text-3xl">
              {["🎉", "⭐", "🎈", "⭐", "🎉"].map((emoji, index) => (
                <span key={index} className="motion-safe:animate-bounce" style={{ animationDelay: `${index * 120}ms` }}>
                  {emoji}
                </span>
              ))}
            </div>
            <CheckCircle2 className="mx-auto mb-3 mt-10 text-emerald-600" size={56} />
            <h3 className="text-2xl font-black text-emerald-900">Well done!</h3>
            <div className="mt-3 flex justify-center gap-1" aria-label={`${stars} out of 3 stars`}>
              {[1, 2, 3].map((n) => (
                <Star key={n} size={40} className={n <= stars ? "fill-amber-400 text-amber-400" : "text-slate-300"} aria-hidden />
              ))}
            </div>
            <p className="mt-2 text-emerald-800">
              You got {result.score} out of {result.total} right.
            </p>
            <button
              type="button"
              onClick={playAgain}
              disabled={!isOnline}
              className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 font-bold text-emerald-800 disabled:opacity-50"
            >
              <RotateCcw size={18} /> Play Again
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
