"use client";
import { useParams } from "next/navigation";
import { ChapterGamesManager } from "@/components/admin/games/ChapterGamesManager";
export default function SuperAdminChapterGamesPage() {
  const params = useParams();
  return <ChapterGamesManager chapterId={params?.id as string} backHref="/dashboard/super-admin/chapters" />;
}
