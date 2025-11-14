import nodemailer from "nodemailer";

const globalForMailer = globalThis as unknown as {
  transporter?: nodemailer.Transporter;
};

async function createTransporter() {
  if (globalForMailer.transporter) return globalForMailer.transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    globalForMailer.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return globalForMailer.transporter;
  }

  const account = await nodemailer.createTestAccount();
  globalForMailer.transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
  return globalForMailer.transporter;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string[];
  subject: string;
  html: string;
}) {
  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: process.env.PLATFORM_FROM ?? "N'GO <noreply@ngo.local>",
    to,
    cc: process.env.PLATFORM_CC,
    subject,
    html,
  });

  if (nodemailer.getTestMessageUrl(info)) {
    console.info("Preview email:", nodemailer.getTestMessageUrl(info));
  }
}

export async function sendConfirmationEmail({
  to,
  type,
}: {
  to: string;
  type: "volunteer" | "association";
}) {
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  await sendEmail({
    to: [to],
    subject:
      type === "volunteer"
        ? "Volunteer profile received"
        : "Association brief received",
    html: `Merci ! Nous avons bien reçu votre ${type === "volunteer" ? "profil" : "brief"}. Nous revenons vite. <br/>Retrouvez-nous : ${siteUrl}`,
  });
}

export async function sendMatchProposalEmail({
  volunteerEmail,
  associationEmail,
  matchId,
  volunteerToken,
  associationToken,
  locale = "en",
}: {
  volunteerEmail: string;
  associationEmail: string;
  matchId: string;
  volunteerToken: string;
  associationToken: string;
  locale?: string;
}) {
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const acceptUrlVolunteer = `${siteUrl}/match/confirm?token=${volunteerToken}&action=accept`;
  const declineUrlVolunteer = `${siteUrl}/match/confirm?token=${volunteerToken}&action=decline`;
  const acceptUrlAssociation = `${siteUrl}/match/confirm?token=${associationToken}&action=accept`;
  const declineUrlAssociation = `${siteUrl}/match/confirm?token=${associationToken}&action=decline`;
  const copy = {
    en: {
      subject: "We found a match!",
      line: "Confirm if this pairing works for you.",
    },
    fr: {
      subject: "On a trouvé un match !",
      line: "Confirmez si cette mise en relation vous convient.",
    },
    es: {
      subject: "¡Tenemos una conexión!",
      line: "Confirma si esta propuesta funciona para ti.",
    },
  }[locale as "en" | "fr" | "es"] ?? {
    subject: "We found a match!",
    line: "Confirm if this pairing works for you.",
  };

  await sendEmail({
    to: [volunteerEmail, associationEmail],
    subject: copy.subject,
    html: `<p>${copy.line}</p>
      <p>Match ${matchId} ready.</p>
      <p>Volunteer: <a href="${acceptUrlVolunteer}">Accept</a> | <a href="${declineUrlVolunteer}">Decline</a></p>
      <p>Association: <a href="${acceptUrlAssociation}">Accept</a> | <a href="${declineUrlAssociation}">Decline</a></p>`,
  });
}

export async function sendAcceptedEmail({
  volunteerEmail,
  associationEmail,
}: {
  volunteerEmail: string;
  associationEmail: string;
}) {
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const slots = [1, 3, 5].map((offset) => {
    const date = new Date(Date.now() + offset * 24 * 60 * 60 * 1000);
    return date.toLocaleString();
  });

  await sendEmail({
    to: [volunteerEmail, associationEmail],
    subject: "Both sides accepted — propose timeslots",
    html: `Great news! Please propose a 30-min slot:<br/>${slots.map((slot) => `<li>${slot}</li>`).join("")}
      <p>Reply-all to confirm.</p>
      <p>${siteUrl}</p>
    `,
  });
}
