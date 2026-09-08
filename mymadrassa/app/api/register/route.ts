import { NextRequest, NextResponse } from "next/server";
import {
  isTrack,
  needsInterview,
  type RegistrationPayload,
} from "@/lib/registration";

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function readString(value: unknown, maxLength = 500) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function readList(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function row(label: string, value: string) {
  if (!value) {
    return "";
  }

  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

function section(title: string, rows: string[]) {
  const body = rows.filter(Boolean).join("\n");

  if (!body) {
    return "";
  }

  return `<hr /><h3>${escapeHtml(title)}</h3>\n${body}`;
}

function buildEmail(data: RegistrationPayload) {
  const isIndividual = data.track === "individual";

  const subject = isIndividual
    ? `New one-to-one enquiry: ${data.programme || "unspecified"}`
    : `New group course enquiry: ${data.groupCourse || "unspecified"}`;

  const html = `
    <h2>${escapeHtml(subject)}</h2>

    <h3>Student</h3>
    ${row("Full name", data.fullName)}
    ${row("Email", data.email)}
    ${row("Phone", data.phone)}
    ${row("Location / timezone", data.location)}
    ${row("Age", data.age)}
    ${row("Gender", data.gender)}
    ${row("Heard about us via", data.heardVia)}

    ${
      isIndividual
        ? section("Programme", [
            row("Programme", data.programme),
            row("Current level", data.level),
            row("Sessions", data.sessionCount),
            row("Session length", data.sessionLength),
            row("Preferred days", data.days.join(", ")),
            row("Preferred times", data.times.join(", ")),
            row("Teacher preference", data.teacherPreference),
          ])
        : section("Course", [
            row("Course", data.groupCourse),
            row("Tier", data.tier),
            row("Experience", data.experience),
            row("Will attend revision sessions", data.attendRevision),
          ])
    }

    ${
      isIndividual && needsInterview(data.programme)
        ? section("Assessment / interview", [
            row("Memorisation", data.hifzStatus),
            row("Riwayah sought", data.riwayah),
            row("Previous ijaazah", data.previousIjaazah),
            row("Current or previous teacher", data.currentTeacher),
            row("Daily revision capacity", data.dailyRevision),
            row("Recitation sample", data.recitationSample),
            row("Availability for oral assessment", data.interviewAvailability),
          ])
        : ""
    }

    ${section("Goals", [
      row("Preferred start", data.startWindow),
      data.goals
        ? `<p><strong>Goals:</strong><br />${escapeHtml(data.goals).replaceAll("\n", "<br />")}</p>`
        : "",
    ])}
  `;

  return { subject, html };
}

async function sendAdminEmail(data: RegistrationPayload) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminInbox = process.env.ADMIN_INBOX_EMAIL;
  const fromEmail = process.env.BOOKING_FROM_EMAIL;

  if (!resendApiKey || !adminInbox || !fromEmail) {
    throw new Error(
      "Registration email is not configured (RESEND_API_KEY, ADMIN_INBOX_EMAIL, BOOKING_FROM_EMAIL).",
    );
  }

  const { subject, html } = buildEmail(data);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [adminInbox],
      subject,
      reply_to: data.email,
      html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(`Resend failed (${response.status}): ${text}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (!isTrack(body.track)) {
      return NextResponse.json(
        { error: "Unknown registration track." },
        { status: 400 },
      );
    }

    const data: RegistrationPayload = {
      track: body.track,
      fullName: readString(body.fullName, 120),
      email: readString(body.email, 200),
      phone: readString(body.phone, 40),
      location: readString(body.location, 120),
      age: readString(body.age, 20),
      gender: readString(body.gender, 20),
      heardVia: readString(body.heardVia, 120),
      goals: readString(body.goals, 2000),
      startWindow: readString(body.startWindow, 60),
      programme: readString(body.programme, 60),
      level: readString(body.level, 80),
      sessionCount: readString(body.sessionCount, 40),
      sessionLength: readString(body.sessionLength, 40),
      days: readList(body.days),
      times: readList(body.times),
      teacherPreference: readString(body.teacherPreference, 40),
      hifzStatus: readString(body.hifzStatus, 80),
      riwayah: readString(body.riwayah, 80),
      previousIjaazah: readString(body.previousIjaazah, 500),
      currentTeacher: readString(body.currentTeacher, 500),
      dailyRevision: readString(body.dailyRevision, 200),
      recitationSample: readString(body.recitationSample, 500),
      interviewAvailability: readString(body.interviewAvailability, 500),
      groupCourse: readString(body.groupCourse, 60),
      tier: readString(body.tier, 60),
      experience: readString(body.experience, 120),
      attendRevision: readString(body.attendRevision, 40),
    };

    if (!data.fullName) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 },
      );
    }

    if (!isValidEmail(data.email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (data.track === "individual" && !data.programme) {
      return NextResponse.json(
        { error: "Please choose a programme." },
        { status: 400 },
      );
    }

    if (data.track === "group" && (!data.groupCourse || !data.tier)) {
      return NextResponse.json(
        { error: "Please choose a course and how you want to study it." },
        { status: 400 },
      );
    }

    await sendAdminEmail(data);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "We could not send that. Please try again." },
      { status: 500 },
    );
  }
}
