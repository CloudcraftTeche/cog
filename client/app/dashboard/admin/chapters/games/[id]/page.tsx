"use client";
import { useParams } from "next/navigation";
import { ChapterGamesManager } from "@/components/admin/games/ChapterGamesManager";
export default function ChapterGamesPage() {
  const params = useParams();
  return <ChapterGamesManager chapterId={params?.id as string} backHref="/dashboard/admin/chapters" />;
}
