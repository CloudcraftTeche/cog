import fs from "fs";
import path from "path";

// Textbook content (PDFs, extracted lessons, drafted games) must never be committed,
// so the textbook scripts only read and write files outside the repository.

export const findRepoRoot = (from: string): string => {
  let dir = from;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("Could not locate the repository root");
};

export const assertOutsideRepo = (label: string, filePath: string, repoRoot = findRepoRoot(__dirname)) => {
  const relative = path.relative(repoRoot, path.resolve(filePath));
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
    throw new Error(
      `${label} must be outside the repository (got ${filePath}). Textbook content must never be committed.`
    );
  }
};
