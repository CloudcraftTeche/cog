// Grades where chapter games replace the multiple-choice quiz (decided 2026-10-28: Grades 1-5;
// KG later, it has no textbook yet). Grade names in the database are "1", "2", ... or "Grade 1".
export const GAME_GRADES = [1, 2, 3, 4, 5];

export const isGameGrade = (gradeName: unknown): boolean => {
  const match = /^(?:grade\s*)?(\d+)$/i.exec(String(gradeName ?? "").trim());
  return !!match && GAME_GRADES.includes(Number(match[1]));
};
