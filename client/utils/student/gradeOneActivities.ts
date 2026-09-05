import type { ChapterActivityConfig } from '@/types/student/activity.types';

const scramble = (id: string, word: string, hint: string) => ({
  id,
  title: 'Scrambled Words',
  description: 'Put the letters in the right order.',
  activity: { type: 'scramble' as const, questions: [{ id: `${id}-q1`, word, hint }] },
});

const matching = (id: string, pairs: { id: string; left: string; right: string }[]) => ({
  id,
  title: 'Match the Following',
  description: 'Tap a card, then tap its match.',
  activity: { type: 'matching' as const, pairs },
});

const coloring = (id: string, imageLabel: string, sections: string[]) => ({
  id,
  title: 'Coloring Time',
  description: 'Color every part of the picture.',
  activity: { type: 'coloring' as const, imageLabel, sections },
});

export const gradeOneActivities: Record<number, ChapterActivityConfig> = {
  1: scramble('grade-1-chapter-1', 'LOVE', 'God shows this to us.'),
  2: matching('grade-1-chapter-2', [
    { id: 'god', left: 'God', right: 'Creator' },
    { id: 'adam', left: 'Adam', right: 'First man' },
  ]),
  3: coloring('grade-1-chapter-3', 'Choose a color for each shape.', ['Heart', 'Path', 'Sun']),
  4: scramble('grade-1-chapter-4', 'ENOCH', 'He walked with God.'),
  5: matching('grade-1-chapter-5', [
    { id: 'noah', left: 'Noah', right: 'Ark' },
    { id: 'rain', left: 'Flood', right: 'Rain' },
  ]),
  6: coloring('grade-1-chapter-6', 'Color Abraham’s starry sky.', ['Star', 'Tent', 'Sky']),
  7: scramble('grade-1-chapter-7', 'LOT', 'God cared for him.'),
  8: matching('grade-1-chapter-8', [
    { id: 'hagar', left: 'Hagar', right: 'Mother' },
    { id: 'help', left: 'God', right: 'Helper' },
  ]),
  9: coloring('grade-1-chapter-9', 'Color Isaac’s happy picture.', ['Heart', 'Mountain', 'Sky']),
  10: scramble('grade-1-chapter-10', 'JACOB', 'God protected him.'),
};

export const getGradeOneActivity = (grade: string, chapterNumber: number) => {
  const gradeNumber = Number(grade.replace(/[^0-9]/g, ''));
  return gradeNumber === 1 ? gradeOneActivities[chapterNumber] : undefined;
};