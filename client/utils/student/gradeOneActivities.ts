import type { ChapterActivityConfig } from '@/types/student/activity.types';

const scramble = (id: string, questions: { word: string; hint: string; scrambled?: string }[]) => ({
  id,
  title: 'Scrambled Words',
  description: 'Put the letters in the right order.',
  activity: { type: 'scramble' as const, questions: questions.map((question, index) => ({ id: `${id}-q${index + 1}`, ...question })) },
});

const matching = (id: string, pairs: { id: string; left: string; right: string }[]) => ({
  id,
  title: 'Match the Following',
  description: 'Drag each card to its matching answer.',
  activity: { type: 'matching' as const, pairs },
});

const coloring = (id: string, imageLabel: string, sections: string[]) => ({
  id,
  title: 'Coloring Time',
  description: 'Color every part of the picture.',
  activity: { type: 'coloring' as const, imageLabel, sections },
});

export const gradeOneActivities: Record<number, ChapterActivityConfig> = {
  1: scramble('grade-1-chapter-1', [{ word: 'LOVE', hint: 'God shows this to us.' }]),
  2: matching('grade-1-chapter-2', [
    { id: 'god', left: 'God', right: 'Creator' },
    { id: 'adam', left: 'Adam', right: 'First man' },
  ]),
  3: coloring('grade-1-chapter-3', 'Choose a color for each shape.', ['Heart', 'Path', 'Sun']),
  4: scramble('grade-1-chapter-4', [{ word: 'ENOCH', hint: 'He walked with God.' }]),
  5: matching('grade-1-chapter-5', [
    { id: 'noah', left: 'Noah', right: 'Ark' },
    { id: 'rain', left: 'Flood', right: 'Rain' },
  ]),
  6: coloring('grade-1-chapter-6', 'Color Abraham’s starry sky.', ['Star', 'Tent', 'Sky']),
  7: scramble('grade-1-chapter-7', [{ word: 'LOT', hint: 'God cared for him.' }]),
  8: matching('grade-1-chapter-8', [
    { id: 'hagar', left: 'Hagar', right: 'Mother' },
    { id: 'help', left: 'God', right: 'Helper' },
  ]),
  9: coloring('grade-1-chapter-9', 'Color Isaac’s happy picture.', ['Heart', 'Mountain', 'Sky']),
  10: scramble('grade-1-chapter-10', [{ word: 'JACOB', hint: 'God protected him.' }]),
};

export const gradeOneChapter18Activities: ChapterActivityConfig[] = [
  {
    id: 'grade-1-chapter-18-scramble',
    title: 'Scramble the Words',
    description: 'Unscramble two Bible words.',
    activity: {
      type: 'scramble',
      questions: [
        { id: 'grade-1-chapter-18-q1', word: 'BABYLON', scrambled: 'NEBALOBY', hint: 'A city where the Israelites were taken captive.' },
        { id: 'grade-1-chapter-18-q2', word: 'FURNACE', scrambled: 'NEAFRUC', hint: 'A very hot place of fire.' },
      ],
    },
  },
  {
    id: 'grade-1-chapter-18-matching',
    title: 'Match the Following',
    description: 'Drag each card to its matching answer.',
    activity: {
      type: 'matching',
      pairs: [
        { id: 'babylon', left: 'Babylon', right: 'Place where the Israelites were taken captive' },
        { id: 'nebuchadnezzar', left: 'Nebuchadnezzar', right: 'King of Babylon' },
        { id: 'three-young-men', left: 'Shadrach, Meshach and Abednego', right: 'Three young men' },
        { id: 'fiery-furnace', left: 'Fiery furnace', right: 'Place of fire' },
      ],
    },
  },
];

export const getGradeOneActivity = (grade: string, chapterNumber: number) => {
  const gradeNumber = Number(grade.replace(/[^0-9]/g, ''));
  return gradeNumber === 1 ? gradeOneActivities[chapterNumber] : undefined;
};

export const getGradeOneActivities = (grade: string, chapterNumber: number) => {
  const gradeNumber = Number(grade.replace(/[^0-9]/g, ''));
  if (gradeNumber !== 1) return [];
  if (chapterNumber === 18) return gradeOneChapter18Activities;
  const activity = gradeOneActivities[chapterNumber];
  return activity ? [activity] : [];
};