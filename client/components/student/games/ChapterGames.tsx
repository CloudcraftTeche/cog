"use client";

import { ArrowRight, CheckCircle2, Loader2, PartyPopper, Star } from "lucide-react";
import { toast } from "sonner";
import { useChapterGames } from "@/hooks/student/useChapterGames";
import { useMarkChapterDone } from "@/hooks/student/useChapters";
import { GameShell, starsFor } from "./GameShell";

interface Props {
  chapterId: string;
  gradeId: string;
  chapterCompleted: boolean;
  onNextChapter: () => void;
}

function Stars({ count, size = 20 }: { count: number; size?: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${count} out of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <Star key={n} size={size} className={n <= count ? "fill-amber-400 text-amber-400" : "text-slate-300"} aria-hidden />
      ))}
    </span>
  );
}

// The games step of a Grades 1-5 chapter (LOGOS-70): every published game, played in order.
// Finishing them all completes the chapter and shows a results summary with stars.
export function ChapterGames({ chapterId, gradeId, chapterCompleted, onNextChapter }: Props) {
  const { data: games, isLoading, isError } = useChapterGames(chapterId);
  const markDone = useMarkChapterDone();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-3xl bg-sky-50 p-6 text-slate-600">
        <Loader2 className="animate-spin" size={20} /> Loading games...
      </div>
    );
  }
  if (isError) {
    return <p className="rounded-3xl bg-rose-50 p-5 text-center font-bold text-rose-800">Games could not be loaded. Please try again.</p>;
  }

  const nextButton = (
    <button
      type="button"
      onClick={onNextChapter}
      className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 text-lg font-black text-white"
    >
      Next chapter <ArrowRight size={20} />
    </button>
  );

  // No games approved for this chapter yet: the lesson is all there is.
  if (!games?.length) {
    return (
      <section className="rounded-3xl bg-sky-50 p-5 text-center">
        {chapterCompleted ? (
          <>
            <p className="flex items-center justify-center gap-2 text-lg font-bold text-emerald-700">
              <CheckCircle2 /> Chapter complete
            </p>
            {nextButton}
          </>
        ) : (
          <>
            <p className="text-slate-700">There are no games for this chapter yet. Finished the lesson?</p>
            <button
              type="button"
              disabled={markDone.isPending}
              onClick={() =>
                markDone.mutate(
                  { chapterId, gradeId },
                  {
                    onSuccess: () => toast.success("Chapter complete! Great work."),
                    onError: () => toast.error("Could not save. Please try again."),
                  }
                )
              }
              className="mt-4 min-h-14 w-full rounded-2xl bg-emerald-600 text-lg font-black text-white disabled:opacity-50"
            >
              {markDone.isPending ? "Saving..." : "I finished this chapter"}
            </button>
          </>
        )}
      </section>
    );
  }

  const finished = games.filter((game) => game.result);
  const allFinished = finished.length === games.length;
  const score = finished.reduce((sum, game) => sum + (game.result?.score ?? 0), 0);
  const total = finished.reduce((sum, game) => sum + (game.result?.total ?? 0), 0);

  return (
    <section className="space-y-4">
      {allFinished ? (
        <div className="rounded-3xl bg-emerald-50 p-5">
          <h2 className="flex items-center gap-2 text-xl font-black text-emerald-900">
            <PartyPopper size={24} /> Chapter complete!
          </h2>
          <p className="mt-1 text-emerald-800">
            You got {score} out of {total} right.
          </p>
          <ul className="mt-4 space-y-2">
            {games.map((game) => (
              <li key={game._id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
                <span className="font-bold text-slate-800">{game.title}</span>
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  {game.result!.score}/{game.result!.total}
                  <Stars count={starsFor(game.result!)} />
                </span>
              </li>
            ))}
          </ul>
          {nextButton}
        </div>
      ) : (
        <div className="rounded-3xl bg-sky-50 p-5">
          <h2 className="text-xl font-black text-slate-900">Games</h2>
          <p className="mt-1 text-slate-600">
            {games.length === 1
              ? "Finish this game to complete this chapter."
              : `Finish all ${games.length} games to complete this chapter. ${finished.length} done so far.`}
          </p>
        </div>
      )}
      {games.map((game, index) => (
        <GameShell
          key={game._id}
          chapterId={chapterId}
          game={game}
          position={index + 1}
          count={games.length}
          onChapterCompleted={() => toast.success("Chapter complete! Great work.")}
        />
      ))}
    </section>
  );
}
