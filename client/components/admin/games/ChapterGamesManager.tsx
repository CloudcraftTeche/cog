"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  Eye,
  Gamepad2,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getGamePlugin } from "@/components/student/games/registry";
import {
  apiErrorMessage,
  useDeleteGame,
  useGameChapter,
  useReorderGames,
  useSetGameStatus,
  useStaffChapterGames,
} from "@/hooks/admin/useChapterGames";
import type { GameStatus, StaffChapterGame } from "@/types/admin/chapterGame.types";
import type { GameType } from "@/types/student/game.types";
import { GAME_FORMS } from "./gameForms";
import { GameEditor } from "./GameEditor";
import { GamePreviewDialog } from "./GamePreviewDialog";
import { LessonPanel } from "./LessonPanel";

const STATUS_STYLE: Record<GameStatus, { label: string; className: string }> = {
  published: { label: "Approved", className: "bg-emerald-100 text-emerald-800" },
  draft: { label: "Draft", className: "bg-amber-100 text-amber-800" },
  rejected: { label: "Rejected", className: "bg-gray-200 text-gray-700" },
};

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : "");
const reviewerName = (game: StaffChapterGame) => (typeof game.reviewedBy === "object" ? game.reviewedBy.name : undefined);

// Games tab for one chapter (admin, super admin, teacher): review drafts against the lesson,
// preview as a student, edit, approve, reject, reorder and add games.
export function ChapterGamesManager({ chapterId, backHref }: { chapterId: string; backHref: string }) {
  const { data: chapter } = useGameChapter(chapterId);
  const { data: games, isLoading, isError } = useStaffChapterGames(chapterId);
  const setStatus = useSetGameStatus();
  const deleteGame = useDeleteGame();
  const reorder = useReorderGames(chapterId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newType, setNewType] = useState<GameType | null>(null);
  const [addType, setAddType] = useState<GameType>("memory_verse");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const changeStatus = async (game: StaffChapterGame, status: GameStatus) => {
    try {
      await setStatus.mutateAsync({ gameId: game._id, status });
      toast.success(status === "published" ? "Approved: students can now play it" : status === "rejected" ? "Rejected" : "Moved back to draft");
    } catch (error) {
      toast.error(apiErrorMessage(error, "The status could not be changed"));
    }
  };

  const remove = async (game: StaffChapterGame) => {
    if (!window.confirm(`Delete "${game.title}"? This cannot be undone.`)) return;
    try {
      await deleteGame.mutateAsync(game._id);
      toast.success("Game deleted");
    } catch (error) {
      toast.error(apiErrorMessage(error, "The game could not be deleted"));
    }
  };

  const move = async (index: number, by: number) => {
    if (!games) return;
    const ids = games.map((game) => game._id);
    [ids[index], ids[index + by]] = [ids[index + by], ids[index]];
    try {
      await reorder.mutateAsync(ids);
    } catch (error) {
      toast.error(apiErrorMessage(error, "The order could not be changed"));
    }
  };

  const counts = (games ?? []).reduce<Record<GameStatus, number>>(
    (total, game) => ({ ...total, [game.status]: total[game.status] + 1 }),
    { published: 0, draft: 0, rejected: 0 }
  );
  const busy = setStatus.isPending || deleteGame.isPending || reorder.isPending;
  const gradeName = chapter && typeof chapter.gradeId === "object" ? chapter.gradeId.grade : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href={backHref}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Chapters
          </Link>
        </Button>

        <div className="mb-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-xl">
          <p className="text-sm font-semibold text-indigo-100">
            {gradeName ? `Grade ${gradeName} · ` : ""}
            {chapter ? `Chapter ${chapter.chapterNumber}` : ""}
          </p>
          <h1 className="text-3xl font-bold">{chapter?.title ?? "Chapter games"}</h1>
          <p className="mt-2 text-indigo-100">
            {counts.published} approved · {counts.draft} draft · {counts.rejected} rejected. Students only see approved games, and
            must finish all of them to complete the chapter.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <LessonPanel chapterId={chapterId} />

          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-4 shadow-sm">
              <Gamepad2 className="h-5 w-5 text-indigo-600" />
              <span className="font-semibold text-gray-800">Add a game:</span>
              <Select value={addType} onValueChange={(value) => setAddType(value as GameType)}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GAME_FORMS).map(([type, form]) => (
                    <SelectItem key={type} value={type}>
                      {form!.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={() => setNewType(addType)} disabled={!!newType}>
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>

            {newType && <GameEditor chapterId={chapterId} type={newType} onDone={() => setNewType(null)} />}

            {isLoading ? (
              <Loader2 className="mx-auto animate-spin text-indigo-600" />
            ) : isError ? (
              <p className="rounded-2xl bg-red-50 p-4 text-red-700">Games could not be loaded.</p>
            ) : !games?.length ? (
              <p className="rounded-2xl bg-white p-6 text-center text-gray-600 shadow-sm">No games in this chapter yet.</p>
            ) : (
              games.map((game, index) => {
                const status = STATUS_STYLE[game.status];
                const canEdit = !!GAME_FORMS[game.type];
                const reviewer = reviewerName(game);
                return (
                  <article key={game._id} className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col">
                        <Button variant="ghost" size="icon" disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label="Move up">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={busy || index === games.length - 1}
                          onClick={() => move(index, 1)}
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-gray-500">{index + 1}.</span>
                          <h3 className="text-lg font-bold text-gray-900">{game.title}</h3>
                          <Badge className={status.className}>{status.label}</Badge>
                          {game.source === "ai" && (
                            <Badge variant="outline" className="gap-1 border-purple-200 text-purple-700">
                              <Sparkles className="h-3 w-3" /> AI draft
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {getGamePlugin(game.type)?.label ?? game.type}
                          {game.instructions ? ` · ${game.instructions}` : ""}
                        </p>
                        {game.reviewedAt && (
                          <p className="text-xs text-gray-500">
                            {game.status === "published" ? "Approved" : "Reviewed"}
                            {reviewer ? ` by ${reviewer}` : ""} on {formatDate(game.reviewedAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPreviewId(game._id)}>
                        <Eye className="mr-1 h-4 w-4" /> Preview
                      </Button>
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(editingId === game._id ? null : game._id)}
                          disabled={busy}
                        >
                          <Pencil className="mr-1 h-4 w-4" /> Edit
                        </Button>
                      )}
                      {game.status !== "published" && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => changeStatus(game, "published")}
                          disabled={busy}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                        </Button>
                      )}
                      {game.status === "published" && (
                        <Button size="sm" variant="outline" onClick={() => changeStatus(game, "draft")} disabled={busy}>
                          <RotateCcw className="mr-1 h-4 w-4" /> Unpublish
                        </Button>
                      )}
                      {game.status === "draft" && (
                        <Button size="sm" variant="outline" onClick={() => changeStatus(game, "rejected")} disabled={busy}>
                          <XCircle className="mr-1 h-4 w-4" /> Reject
                        </Button>
                      )}
                      {game.status === "rejected" && (
                        <Button size="sm" variant="outline" onClick={() => changeStatus(game, "draft")} disabled={busy}>
                          <RotateCcw className="mr-1 h-4 w-4" /> Back to draft
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(game)} disabled={busy}>
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </div>

                    {editingId === game._id && (
                      <GameEditor chapterId={chapterId} type={game.type} game={game} onDone={() => setEditingId(null)} />
                    )}
                  </article>
                );
              })
            )}
          </section>
        </div>
      </div>

      <GamePreviewDialog chapterId={chapterId} gameId={previewId} onClose={() => setPreviewId(null)} />
    </div>
  );
}
