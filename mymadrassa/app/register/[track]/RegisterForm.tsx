"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChipGroup,
  ChoiceCards,
  Field,
  Section,
  Select,
  TextArea,
  TextInput,
} from "./FormControls";
import {
  dayOptions,
  emptyRegistration,
  genders,
  groupCourses,
  groupExperience,
  groupTiers,
  hifzStatuses,
  individualProgrammes,
  levels,
  needsInterview,
  riwayaat,
  sessionCounts,
  sessionLengths,
  startWindows,
  teacherPreferences,
  timeOptions,
  type RegistrationPayload,
  type Track,
} from "@/lib/registration";

type Errors = Partial<Record<keyof RegistrationPayload, string>>;

export default function RegisterForm({ track }: { track: Track }) {
  const searchParams = useSearchParams();

  // Course pages link here with ?course=<slug> so the programme arrives preselected.
  const requestedCourse = searchParams.get("course") ?? "";

  const [answers, setAnswers] = useState<RegistrationPayload>(() => ({
    ...emptyRegistration,
    track,
    programme:
      track === "individual" &&
      individualProgrammes.some((p) => p.value === requestedCourse)
        ? requestedCourse
        : "",
    groupCourse:
      track === "group" &&
      groupCourses.some((c) => c.value === requestedCourse)
        ? requestedCourse
        : "",
  }));

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const set = <K extends keyof RegistrationPayload>(
    field: K,
    value: RegistrationPayload[K],
  ) => {
    setAnswers((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const toggle = (field: "days" | "times", option: string) => {
    setAnswers((current) => ({
      ...current,
      [field]: current[field].includes(option)
        ? current[field].filter((item) => item !== option)
        : [...current[field], option],
    }));
  };

  const isIndividual = track === "individual";

  const showInterview = isIndividual && needsInterview(answers.programme);

  const showMentorshipExtras = !isIndividual && answers.tier === "mentorship";

  const programmeLabel = useMemo(() => {
    const list = isIndividual ? individualProgrammes : groupCourses;
    const key = isIndividual ? answers.programme : answers.groupCourse;

    return list.find((item) => item.value === key)?.label ?? "";
  }, [isIndividual, answers.programme, answers.groupCourse]);

  const validate = () => {
    const next: Errors = {};

    if (!answers.fullName.trim()) {
      next.fullName = "Please enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email.trim())) {
      next.email = "Please enter a valid email address.";
    }

    if (!answers.phone.trim()) {
      next.phone = "Please enter a phone number we can reach you on.";
    }

    if (isIndividual && !answers.programme) {
      next.programme = "Please choose a programme.";
    }

    if (!isIndividual && !answers.groupCourse) {
      next.groupCourse = "Please choose a course.";
    }

    if (!isIndividual && !answers.tier) {
      next.tier = "Please choose how you want to study.";
    }

    if (showInterview && !answers.hifzStatus) {
      next.hifzStatus = "Please tell us where your memorisation stands.";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!validate()) {
      // Send focus to the first thing that needs fixing rather than leaving
      // the reader to hunt for a red line further up a long form.
      document
        .querySelector("[data-invalid='true']")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });

      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);

        return;
      }

      setSubmitted(true);
    } catch {
      setFormError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white border border-line rounded-3xl p-8 md:p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-accent text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
          ✓
        </div>
        <h2 className="text-3xl font-bold text-ink mb-4">
          Jazakum Allahu khayran.
        </h2>
        <p className="text-muted text-base leading-relaxed max-w-lg mx-auto mb-8">
          Your enquiry
          {programmeLabel ? ` about ${programmeLabel}` : ""} has reached us. A
          member of the team will email you
          {showInterview
            ? " to arrange your oral assessment."
            : " with next steps and available places."}
        </p>
        <Link
          href="/"
          className="inline-block bg-sidebar text-white font-bold px-8 py-4 rounded-2xl text-base hover:opacity-90 transition-opacity"
        >
          Back to home
        </Link>
      </div>
    );
  }

  let step = 0;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Section
        index={(step += 1)}
        title={isIndividual ? "Your programme" : "Your course"}
        hint={
          isIndividual
            ? "Not sure which one? Choose the closest and say so in your goals — we will steer you at the diagnostic call."
            : "Each course runs on a fixed syllabus with a shared start date."
        }
      >
        <div data-invalid={Boolean(errors.programme || errors.groupCourse)}>
          <Field
            label={isIndividual ? "Which programme?" : "Which course?"}
            error={errors.programme ?? errors.groupCourse}
          >
            <ChoiceCards
              columns={2}
              value={isIndividual ? answers.programme : answers.groupCourse}
              onChange={(value) =>
                set(isIndividual ? "programme" : "groupCourse", value)
              }
              options={isIndividual ? individualProgrammes : groupCourses}
            />
          </Field>
        </div>

        {!isIndividual && (
          <div data-invalid={Boolean(errors.tier)}>
            <Field label="How do you want to study it?" error={errors.tier}>
              <ChoiceCards
                columns={2}
                value={answers.tier}
                onChange={(value) => set("tier", value)}
                options={groupTiers}
              />
            </Field>
          </div>
        )}

        {!isIndividual && (
          <Field label="Where are you starting from?">
            <Select
              value={answers.experience}
              onChange={(value) => set("experience", value)}
              options={groupExperience}
            />
          </Field>
        )}

        {isIndividual && (
          <Field label="Your current level">
            <Select
              value={answers.level}
              onChange={(value) => set("level", value)}
              options={levels}
            />
          </Field>
        )}
      </Section>

      {showMentorshipExtras && (
        <Section
          index={(step += 1)}
          title="Your live sessions"
          hint="Mentorship adds a Q&A slot and group revision on top of the recordings. Tell us when you can realistically make them."
          accent
        >
          <Field label="Which time windows suit you?">
            <ChipGroup
              values={answers.times}
              onToggle={(option) => toggle("times", option)}
              options={timeOptions}
            />
          </Field>

          <Field label="Will you attend the group revision sessions?">
            <ChoiceCards
              columns={3}
              value={answers.attendRevision}
              onChange={(value) => set("attendRevision", value)}
              options={[
                { value: "yes", label: "Yes, every week" },
                { value: "sometimes", label: "When I can" },
                { value: "recordings", label: "I'll catch recordings" },
              ]}
            />
          </Field>
        </Section>
      )}

      {isIndividual && (
        <Section
          index={(step += 1)}
          title="Your week"
          hint="Private sessions are scheduled around you, so this decides which teachers we can offer."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="How often would you like to meet?">
              <Select
                value={answers.sessionCount}
                onChange={(value) => set("sessionCount", value)}
                options={sessionCounts}
              />
            </Field>
            <Field label="How long per session?">
              <Select
                value={answers.sessionLength}
                onChange={(value) => set("sessionLength", value)}
                options={sessionLengths}
              />
            </Field>
          </div>

          <Field label="Which days work?">
            <ChipGroup
              values={answers.days}
              onToggle={(option) => toggle("days", option)}
              options={dayOptions}
            />
          </Field>

          <Field
            label="Which times work?"
            hint="In your own local time — tell us your city below and we will convert."
          >
            <ChipGroup
              values={answers.times}
              onToggle={(option) => toggle("times", option)}
              options={timeOptions}
            />
          </Field>

          <Field label="Teacher preference">
            <ChoiceCards
              columns={3}
              value={answers.teacherPreference}
              onChange={(value) => set("teacherPreference", value)}
              options={teacherPreferences.map((preference) => ({
                value: preference,
                label: preference,
              }))}
            />
          </Field>
        </Section>
      )}

      {showInterview && (
        <Section
          index={(step += 1)}
          title="Assessment"
          hint="Ijaazah and Qira'aat carry a chain of transmission, so a place is offered only after an oral assessment with a scholar. These answers let the panel prepare properly."
          accent
        >
          <div data-invalid={Boolean(errors.hifzStatus)}>
            <Field
              label="Where does your memorisation stand?"
              error={errors.hifzStatus}
            >
              <Select
                value={answers.hifzStatus}
                onChange={(value) => set("hifzStatus", value)}
                options={hifzStatuses}
              />
            </Field>
          </div>

          <Field label="Which riwayah are you seeking?">
            <Select
              value={answers.riwayah}
              onChange={(value) => set("riwayah", value)}
              options={riwayaat}
            />
          </Field>

          <Field
            label="Have you received an ijaazah before?"
            hint="If yes, in which riwayah and from which shaykh."
          >
            <TextInput
              value={answers.previousIjaazah}
              onChange={(value) => set("previousIjaazah", value)}
              placeholder="e.g. Hafs 'an 'Asim, from Shaykh… in 2022"
            />
          </Field>

          <Field
            label="Who have you studied under?"
            hint="Current or previous teachers, and where you memorised."
          >
            <TextArea
              value={answers.currentTeacher}
              onChange={(value) => set("currentTeacher", value)}
              placeholder="Teacher names, institute, years studied…"
            />
          </Field>

          <Field label="How much can you revise daily?">
            <TextInput
              value={answers.dailyRevision}
              onChange={(value) => set("dailyRevision", value)}
              placeholder="e.g. 2 juz a day, an hour each morning"
            />
          </Field>

          <Field
            label="Link to a recitation sample"
            hint="A short audio or video of your recitation — a private YouTube or Drive link is fine. Optional, but it speeds up the assessment."
          >
            <TextInput
              type="url"
              value={answers.recitationSample}
              onChange={(value) => set("recitationSample", value)}
              placeholder="https://…"
            />
          </Field>

          <Field label="When could you sit the oral assessment?">
            <TextArea
              value={answers.interviewAvailability}
              onChange={(value) => set("interviewAvailability", value)}
              placeholder="e.g. weekday evenings after 7pm UK, or Saturday mornings"
            />
          </Field>
        </Section>
      )}

      <Section index={(step += 1)} title="About you">
        <div data-invalid={Boolean(errors.fullName)}>
          <Field label="Full name" error={errors.fullName}>
            <TextInput
              value={answers.fullName}
              onChange={(value) => set("fullName", value)}
              autoComplete="name"
              placeholder="e.g. Abdullah Khan"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div data-invalid={Boolean(errors.email)}>
            <Field label="Email" error={errors.email}>
              <TextInput
                type="email"
                value={answers.email}
                onChange={(value) => set("email", value)}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </Field>
          </div>
          <div data-invalid={Boolean(errors.phone)}>
            <Field label="Phone" error={errors.phone}>
              <TextInput
                type="tel"
                value={answers.phone}
                onChange={(value) => set("phone", value)}
                autoComplete="tel"
                placeholder="+44…"
              />
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="City and country">
            <TextInput
              value={answers.location}
              onChange={(value) => set("location", value)}
              placeholder="e.g. Leicester, UK"
            />
          </Field>
          <Field label="Student age">
            <TextInput
              value={answers.age}
              onChange={(value) => set("age", value)}
              placeholder="e.g. 24"
            />
          </Field>
          <Field label="Gender">
            <Select
              value={answers.gender}
              onChange={(value) => set("gender", value)}
              options={genders}
            />
          </Field>
        </div>
      </Section>

      <Section index={(step += 1)} title="Your goals">
        <Field label="When would you like to start?">
          <Select
            value={answers.startWindow}
            onChange={(value) => set("startWindow", value)}
            options={startWindows}
          />
        </Field>

        <Field
          label="What do you want to reach?"
          hint="A sentence or two is plenty. This is the part teachers read first."
        >
          <TextArea
            value={answers.goals}
            onChange={(value) => set("goals", value)}
            placeholder="e.g. I want to fix my tajweed so I am not embarrassed leading salah, and finish Juz Amma by Ramadan."
          />
        </Field>

        <Field label="How did you hear about us?">
          <TextInput
            value={answers.heardVia}
            onChange={(value) => set("heardVia", value)}
            placeholder="e.g. a friend, Instagram, our YouTube"
          />
        </Field>
      </Section>

      {formError && (
        <p className="text-red-700 text-sm" role="alert">
          {formError}
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-sidebar text-white font-bold px-10 py-4 rounded-2xl text-base hover:opacity-90 transition-opacity shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending…" : "Send my enquiry →"}
        </button>
        <p className="text-muted text-sm">
          No payment now. We reply by email within a few days.
        </p>
      </div>
    </form>
  );
}
