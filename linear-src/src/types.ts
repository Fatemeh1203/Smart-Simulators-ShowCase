export type Role = "student" | "teacher";

export type Theme = "light" | "dark";

export type StudentView =
  | "dashboard"
  | "path"
  | "lesson"
  | "plane"
  | "slope"
  | "equation"
  | "linelab"
  | "explore"
  | "challenges"
  | "matching"
  | "quizzes"
  | "quiz"
  | "achievements"
  | "progress"
  | "settings"
  | "solver"
  | "compare"
  | "lab3d"
  | "mission";

export type TeacherView =
  | "dashboard"
  | "classes"
  | "student"
  | "content"
  | "assignments"
  | "assignment-builder"
  | "quizzes"
  | "quiz-builder"
  | "analytics"
  | "lab"
  | "live"
  | "presentation"
  | "settings";

export type Point = {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
};

export type LessonId =
  | "coord"
  | "points"
  | "line"
  | "slope"
  | "slope-sign"
  | "hv"
  | "equation"
  | "slope-intercept"
  | "two-points"
  | "graph-eq"
  | "convert"
  | "two-lines"
  | "mixed";

export type Lesson = {
  id: LessonId;
  index: number;
  title: string;
  subtitle: string;
  minutes: number;
  xp: number;
  formula?: string;
  goals: string[];
  theory: { title: string; body: string }[];
  insight: string;
};

export type QuestionKind =
  | "mcq"
  | "tf"
  | "blank"
  | "slope-type"
  | "match"
  | "place-point"
  | "set-mb"
  | "two-point-eq";

export type Question = {
  id: string;
  lesson: LessonId | "mixed";
  kind: QuestionKind;
  prompt: string;
  options?: string[];
  answer: string | number | boolean;
  explanation: string;
  errorHint: string;
  difficulty: "easy" | "medium" | "hard";
};

export type Badge = {
  id: string;
  title: string;
  desc: string;
  icon: string;
};

export type ClassStudent = {
  id: string;
  code: string;
  progress: number;
  xp: number;
  accuracy: number;
  minutes: number;
  weak: string;
  strong: string;
  last: string;
  scores: number[];
};

export type Assignment = {
  id: string;
  title: string;
  topic: string;
  level: "آسان" | "متوسط" | "سخت";
  count: number;
  minutes: number;
  start: string;
  end: string;
  status: "فعال" | "پیش‌نویس" | "پایان‌یافته";
};

export type QuizDef = {
  id: string;
  title: string;
  topic: string;
  count: number;
  minutes: number;
  level: string;
  status: string;
};
