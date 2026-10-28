// Grades where chapter games replace the quiz (Grades 1-5). Mirrors server/src/utils/games/gameGrades.ts.
export const GAME_GRADES = [1, 2, 3, 4, 5];

export const isGameGrade = (gradeName: unknown): boolean => {
  const match = /^(?:grade\s*)?(\d+)$/i.exec(String(gradeName ?? "").trim());
  return !!match && GAME_GRADES.includes(Number(match[1]));
};

export const gradeNameOf = (gradeId: unknown): string | undefined =>
  typeof gradeId === "object" && gradeId !== null ? (gradeId as { grade?: string }).grade : undefined;
