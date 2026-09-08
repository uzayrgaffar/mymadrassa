import { courses } from "@/lib/courses";

export type Track = "individual" | "group";

export function isTrack(value: unknown): value is Track {
  return value === "individual" || value === "group";
}

/** One-to-one programmes come straight from the catalogue so the two never drift. */
export const individualProgrammes = courses.map((course) => ({
  value: course.slug,
  label: course.name,
  hint: course.subtitle,
}));

export const groupCourses = [
  {
    value: "arabic",
    label: "Arabic",
    hint: "Grammar, vocabulary and comprehension",
  },
  {
    value: "al-jazariyyah",
    label: "al-Jazariyyah",
    hint: "The classical tajweed poem of Ibn al-Jazari",
  },
  {
    value: "tuhfatul-atfaal",
    label: "Tuhfatul Atfaal",
    hint: "The beginner's tajweed primer",
  },
];

export const groupTiers = [
  {
    value: "self-paced",
    label: "Self-Paced",
    hint: "Recordings only — full library, watch anytime",
  },
  {
    value: "mentorship",
    label: "Recordings + Mentorship",
    hint: "Adds a live Q&A slot and group revision sessions",
  },
];

/** Programmes that require an oral assessment before a place is offered. */
export const interviewProgrammes = ["ijaazah", "qiraat"];

export function needsInterview(programme: string) {
  return interviewProgrammes.includes(programme);
}

export const levels = [
  "Cannot yet read Arabic script",
  "Reading Qaaida",
  "Reads the Qur'an with mistakes",
  "Reads fluently, learning tajweed",
  "Fluent with tajweed",
  "Currently memorising",
  "Completed hifz",
];

export const sessionCounts = [
  "1 session a week",
  "2 sessions a week",
  "3 sessions a week",
  "4 sessions a week",
  "5 or more a week",
  "Daily",
];

export const sessionLengths = ["30 minutes", "45 minutes", "60 minutes"];

export const teacherPreferences = [
  "Male teacher",
  "Female teacher",
  "No preference",
];

export const startWindows = [
  "As soon as possible",
  "Within a month",
  "In 2–3 months",
  "Just exploring for now",
];

export const dayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const timeOptions = [
  "Early morning (before 9am)",
  "Late morning (9am–12pm)",
  "Afternoon (12–5pm)",
  "Evening (5–9pm)",
  "Late evening (after 9pm)",
];

export const genders = ["Male", "Female"];

export const hifzStatuses = [
  "Completed the full Qur'an",
  "Memorised 20–29 juz",
  "Memorised 10–19 juz",
  "Memorised 1–9 juz",
  "Not memorising yet",
];

export const riwayaat = [
  "Hafs 'an 'Asim",
  "Shu'bah 'an 'Asim",
  "Warsh 'an Nafi'",
  "Qaloon 'an Nafi'",
  "Al-Duri 'an Abi 'Amr",
  "Not sure yet",
];

export const groupExperience = [
  "Complete beginner to this subject",
  "Studied a little before",
  "Studied it formally before",
  "Revising something I already know",
];

/** Every field the API accepts, so the route can validate without guessing. */
export type RegistrationPayload = {
  track: Track;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  age: string;
  gender: string;
  heardVia: string;
  goals: string;
  startWindow: string;

  // Individual only
  programme: string;
  level: string;
  sessionCount: string;
  sessionLength: string;
  days: string[];
  times: string[];
  teacherPreference: string;

  // Interview (ijaazah / qira'aat)
  hifzStatus: string;
  riwayah: string;
  previousIjaazah: string;
  currentTeacher: string;
  dailyRevision: string;
  recitationSample: string;
  interviewAvailability: string;

  // Group only
  groupCourse: string;
  tier: string;
  experience: string;
  attendRevision: string;
};

export const emptyRegistration: RegistrationPayload = {
  track: "individual",
  fullName: "",
  email: "",
  phone: "",
  location: "",
  age: "",
  gender: "",
  heardVia: "",
  goals: "",
  startWindow: "",
  programme: "",
  level: "",
  sessionCount: "",
  sessionLength: "",
  days: [],
  times: [],
  teacherPreference: "",
  hifzStatus: "",
  riwayah: "",
  previousIjaazah: "",
  currentTeacher: "",
  dailyRevision: "",
  recitationSample: "",
  interviewAvailability: "",
  groupCourse: "",
  tier: "",
  experience: "",
  attendRevision: "",
};

export const trackCopy: Record<
  Track,
  { eyebrow: string; title: string; intro: string }
> = {
  individual: {
    eyebrow: "One-to-One Mentorship",
    title: "Tell us who you are and what you want to reach.",
    intro:
      "Private sessions are built around one student. The more we know about your level and your week, the better we can match you to a teacher who fits both.",
  },
  group: {
    eyebrow: "Group Courses",
    title: "Join the next cohort.",
    intro:
      "Group courses run on a shared syllabus. Pick the course and how much teacher contact you want, and we will let you know when the next intake opens.",
  },
};
