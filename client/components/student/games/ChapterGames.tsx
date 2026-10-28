"use client";

import { Loader2, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { useChapterGames } from "@/hooks/student/useChapterGames";
import { GameShell } from "./GameShell";

// The games section of a chapter page: every published game, played in order.
export function ChapterGames({ chapterId }: { chapterId: string }) {
  const { data: games, isLoading, isError } = useChapterGames(chapterId);

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
  if (!games?.length) return null;

  const finished = games.filter((game) => game.result).length;
  const allFinished = finished === games.length;

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-sky-50 p-5">
        <h2 className="text-xl font-black text-slate-900">Games</h2>
        <p className="mt-1 text-slate-600">
          {allFinished
            ? "You finished every game in this chapter!"
            : games.length === 1
              ? "Finish this game to complete this chapter."
              : `Finish all ${games.length} games to complete this chapter. ${finished} done so far.`}
        </p>
        {allFinished && (
          <p className="mt-3 flex items-center gap-2 font-bold text-emerald-700">
            <PartyPopper size={20} /> Chapter complete
          </p>
        )}
      </div>
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
