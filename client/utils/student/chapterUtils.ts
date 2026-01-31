// utils/chapterUtils.ts
import type { Chapter, UnitGroup, SubmissionType } from '@/types/student/chapter.types';

// Unit color classes
export const unitColors = [
  'from-purple-400 to-pink-400',
  'from-blue-400 to-cyan-400',
  'from-green-400 to-emerald-400',
  'from-orange-400 to-red-400',
  'from-rose-400 to-pink-400',
  'from-indigo-400 to-purple-400',
  'from-violet-400 to-fuchsia-400',
  'from-teal-400 to-emerald-400',
];

// Get unit color by index
export const getUnitColor = (index: number): string => {
  return unitColors[index % unitColors.length];
};

// Group chapters by unit
export const groupChaptersByUnit = (chapters: Chapter[]): UnitGroup[] => {
  const unitMap = new Map<string, UnitGroup>();

  chapters.forEach((chapter) => {
    const unitId = chapter.unitId;
    if (!unitId) return;

    if (!unitMap.has(unitId)) {
      unitMap.set(unitId, {
        unitId: unitId,
        unitName: chapter.unitName || 'Unnamed Unit',
        unitDescription: chapter.unitDescription,
        grade: chapter.gradeId?.grade || 'N/A',
        chapters: [],
      });
    }

    unitMap.get(unitId)!.chapters.push(chapter);
  });

  // Sort chapters within each unit
  unitMap.forEach((unitGroup) => {
    unitGroup.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
  });

  return Array.from(unitMap.values());
};

// Find next chapter in the same unit
export const findNextChapter = (
  currentChapter: Chapter,
  allChapters: Chapter[]
): Chapter | null => {
  const sameUnitChapters = allChapters
    .filter((ch) => ch.unitId === currentChapter.unitId)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const currentIndex = sameUnitChapters.findIndex(
    (ch) => ch._id === currentChapter._id
  );

  if (currentIndex !== -1 && currentIndex < sameUnitChapters.length - 1) {
    const next = sameUnitChapters[currentIndex + 1];
    return next.isAccessible ? next : null;
  }

  return null;
};

// Check if chapter is accessible
export const isChapterAccessible = (chapter: Chapter): boolean => {
  return (
    chapter.isAccessible ||
    chapter.isInProgress ||
    chapter.isCompleted ||
    chapter.status === 'accessible' ||
    chapter.status === 'in_progress' ||
    chapter.status === 'completed'
  );
};

// Get YouTube embed URL
export const getYouTubeEmbedUrl = (url?: string): string | null => {
  if (!url) return null;

  let videoId: string | undefined;

  if (url.includes('watch?v=')) {
    videoId = url.split('watch?v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  }

  if (!videoId) return null;

  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&fs=1&iv_load_policy=3`;
};

// Check if URL is YouTube
export const isYouTubeUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

// Validate file for submission
export const validateSubmissionFile = (
  file: File,
  type: SubmissionType
): string | null => {
  const maxSize = 25 * 1024 * 1024; // 25MB

  if (file.size > maxSize) {
    return 'File size must be less than 25MB';
  }

  if (type === 'video') {
    const validTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/webm',
      'video/x-msvideo',
    ];
    if (!validTypes.includes(file.type)) {
      return 'Only MP4, MPEG, MOV, WebM, and AVI videos are allowed';
    }
  } else if (type === 'pdf') {
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are allowed';
    }
  }

  return null;
};

// Calculate quiz score
export const calculateQuizScore = (
  questions: { correctAnswer: string }[],
  selectedAnswers: Record<number, string>
): number => {
  if (!questions || questions.length === 0) return 0;

  const correctCount = questions.reduce((count, q, i) => {
    return selectedAnswers[i] === q.correctAnswer ? count + 1 : count;
  }, 0);

  return Math.round((correctCount / questions.length) * 100);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};