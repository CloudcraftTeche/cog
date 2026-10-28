"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage, useCreateGame, useUpdateGame } from "@/hooks/admin/useChapterGames";
import type { StaffChapterGame } from "@/types/admin/chapterGame.types";
import type { GameType } from "@/types/student/game.types";
import { GAME_FORMS } from "./gameForms";

interface Props {
  chapterId: string;
  type: GameType;
  game?: StaffChapterGame; // editing an existing game; new games are created as drafts
  onDone: () => void;
}

export function GameEditor({ chapterId, type, game, onDone }: Props) {
  const definition = GAME_FORMS[type];
  const createGame = useCreateGame(chapterId);
  const updateGame = useUpdateGame();
  const [title, setTitle] = useState(game?.title ?? definition?.label ?? "");
  const [instructions, setInstructions] = useState(game?.instructions ?? "");
  const [state, setState] = useState(() => (game ? definition?.fromGame(game.config, game.answerKey) : definition?.empty()));
  const [error, setError] = useState<string | null>(null);
  const saving = createGame.isPending || updateGame.isPending;

  if (!definition) return <p className="text-sm text-gray-600">This game type can&apos;t be edited here.</p>;

  const save = async () => {
    setError(null);
    const input = { type, title: title.trim(), instructions: instructions.trim(), ...definition.toGame(state) };
    try {
      if (game) await updateGame.mutateAsync({ gameId: game._id, input });
      else await createGame.mutateAsync(input);
      toast.success(game ? "Game saved" : "Game added as a draft");
      onDone();
    } catch (saveError) {
      setError(apiErrorMessage(saveError, "The game could not be saved"));
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-indigo-100 bg-white p-4">
      {game?.status === "published" && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">This game is approved: saved changes reach students straight away.</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-gray-600">Title shown to the child</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-gray-600">Instructions (read aloud)</Label>
          <Input value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={500} />
        </div>
      </div>
      <definition.Fields value={state} onChange={setState} />
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
        <Button type="button" onClick={save} disabled={saving || !title.trim()}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {game ? "Save changes" : "Add as draft"}
        </Button>
      </div>
    </div>
  );
}
