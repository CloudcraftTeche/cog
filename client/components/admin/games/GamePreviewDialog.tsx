"use client";

import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GameShell } from "@/components/student/games/GameShell";
import { previewCheck, previewSubmit, useGamePreview } from "@/hooks/admin/useChapterGames";

// Plays a game exactly as a student would see it. Answers are checked on the server; nothing is saved.
export function GamePreviewDialog({ chapterId, gameId, onClose }: { chapterId: string; gameId: string | null; onClose: () => void }) {
  const { data: game, isLoading, isError } = useGamePreview(gameId);

  return (
    <Dialog open={!!gameId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student preview</DialogTitle>
          <DialogDescription>Play the game as a child would. Nothing is saved.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Loader2 className="mx-auto animate-spin text-indigo-600" />
        ) : isError || !game ? (
          <p className="text-center text-sm text-red-700">The preview could not be loaded.</p>
        ) : (
          <GameShell
            key={game._id}
            chapterId={chapterId}
            game={game}
            position={1}
            count={1}
            checkAnswer={(itemId, answer) => previewCheck(game._id, itemId, answer)}
            submitAnswers={(answers) => previewSubmit(game._id, answers)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
