import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function send({ to, subject, html }) {
  if (!process.env.SMTP_USER) return
  await transporter.sendMail({
    from: `VibeCarpool <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  })
}

const loginUrl = (email) =>
  `https://vibe-carpool.netlify.app/login?email=${encodeURIComponent(email)}`

const btn = (href, label) =>
  `<p style="margin:24px 0"><a href="${href}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700">${label}</a></p>`

const footer = `<p style="color:#94a3b8;font-size:12px;margin-top:32px">VibeCarpool — your ride coordinator</p>`

export async function sendRemovedFromRideEmail({ to, passengerName, driverName, startingPlace }) {
  await send({
    to,
    subject: 'You have been removed from a carpool ride',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1e293b">Carpool update</h2>
        <p>Hi <strong>${passengerName}</strong>,</p>
        <p>The driver <strong>${driverName}</strong> has removed you from their ride departing from
           <strong>${startingPlace}</strong>.</p>
        <p>Log back in to find another available ride.</p>
        ${btn(loginUrl(to), 'Find a new ride')}
        ${footer}
      </div>
    `,
  })
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  await send({
    to,
    subject: 'Reset your VibeCarpool password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1e293b">Password reset</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        ${btn(resetUrl, 'Reset my password')}
        <p style="color:#94a3b8;font-size:12px">If you didn't request this, you can ignore this email.</p>
        ${footer}
      </div>
    `,
  })
}

export async function sendNewPassengerEmail({
  to, driverName, passengerName, passengerEmail, passengerPhone,
  startingPlace, filledSeats, totalSeats,
}) {
  await send({
    to,
    subject: `New passenger: ${passengerName} joined your ride`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1e293b">New passenger in your car</h2>
        <p>Hi <strong>${driverName}</strong>,</p>
        <p><strong>${passengerName}</strong> just joined your ride from
           <strong>${startingPlace}</strong>.</p>
        <table style="border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:4px 12px 4px 0;color:#64748b">Email</td>
              <td><a href="mailto:${passengerEmail}">${passengerEmail}</a></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#64748b">Phone</td>
              <td>${passengerPhone}</td></tr>
        </table>
        <p>Your car is now <strong>${filledSeats}/${totalSeats}</strong> seats filled.</p>
        ${btn(loginUrl(to), 'View your dashboard')}
        ${footer}
      </div>
    `,
  })
}
