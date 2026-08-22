/**
 * Email Service — Smart Campus Lost & Found
 * Sends Gmail notifications to both parties when a match is confirmed.
 * Uses Nodemailer with Gmail App Passwords (no OAuth needed) + Direct Web Gmail Compose URL generator.
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.join(__dirname, '..', '.env');

// In-memory recent email dispatch log
const emailLogs = [];

let transporter = null;
let currentGmailUser = process.env.GMAIL_USER || '';
let currentGmailPass = process.env.GMAIL_APP_PASSWORD || '';

function getTransporter() {
  if (transporter) return transporter;

  const user = currentGmailUser || process.env.GMAIL_USER;
  const pass = currentGmailPass || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass || user === 'your.email@gmail.com' || pass === 'your_16_char_app_password') {
    console.log('📧 Email Service: No active Gmail credentials. Emails will be logged & direct Gmail links generated.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
    console.log(`📧 Email Service: Gmail transport initialized for ${user}`);
    return transporter;
  } catch (err) {
    console.error('📧 Email Service init error:', err.message);
    return null;
  }
}

/**
 * Configure Gmail credentials at runtime and persist to .env
 */
export function updateCredentials({ user, pass }) {
  currentGmailUser = user.trim();
  currentGmailPass = pass.trim();
  transporter = null; // reset transporter

  // Persist to .env
  try {
    let envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';
    if (envContent.includes('GMAIL_USER=')) {
      envContent = envContent.replace(/GMAIL_USER=.*/g, `GMAIL_USER=${currentGmailUser}`);
    } else {
      envContent += `\nGMAIL_USER=${currentGmailUser}`;
    }
    if (envContent.includes('GMAIL_APP_PASSWORD=')) {
      envContent = envContent.replace(/GMAIL_APP_PASSWORD=.*/g, `GMAIL_APP_PASSWORD=${currentGmailPass}`);
    } else {
      envContent += `\nGMAIL_APP_PASSWORD=${currentGmailPass}`;
    }
    fs.writeFileSync(ENV_PATH, envContent, 'utf8');
    process.env.GMAIL_USER = currentGmailUser;
    process.env.GMAIL_APP_PASSWORD = currentGmailPass;
  } catch (err) {
    console.warn('Could not write to .env:', err.message);
  }

  return {
    configured: Boolean(currentGmailUser && currentGmailPass && currentGmailUser !== 'your.email@gmail.com'),
    user: currentGmailUser
  };
}

export function getConfigStatus() {
  const user = currentGmailUser || process.env.GMAIL_USER || '';
  const pass = currentGmailPass || process.env.GMAIL_APP_PASSWORD || '';
  const isConfigured = Boolean(user && pass && user !== 'your.email@gmail.com' && pass !== 'your_16_char_app_password');

  return {
    isConfigured,
    user: isConfigured ? user : null,
    totalDispatched: emailLogs.length
  };
}

// ─── Direct Web Gmail Compose Link Generator ─────────────────────────────────

export function buildDirectGmailLink({ to, subject, bodyText }) {
  const encTo = encodeURIComponent(to || '');
  const encSub = encodeURIComponent(subject || '');
  const encBody = encodeURIComponent(bodyText || '');
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}&su=${encSub}&body=${encBody}`;
}

// ─── HTML Email Templates ────────────────────────────────────────────────────

function buildLostPersonEmail({ lostRep, foundRep, match }) {
  const score = Math.round(match.confidence_score);
  const scoreColor = score >= 90 ? '#6366f1' : score >= 75 ? '#8b5cf6' : '#f59e0b';
  const lostDate = new Date(lostRep.date_time).toLocaleString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Great News — Your Item May Have Been Found!</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid rgba(99,102,241,0.3);box-shadow:0 25px 50px rgba(0,0,0,0.4);">

          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#db2777 100%);padding:40px 40px 30px;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">🎉</div>
              <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 8px;letter-spacing:-0.5px;">Great News! Your Item Was Found</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0;">Our AI engine found a <strong>${score}% confidence match</strong> for your lost report</p>
            </td>
          </tr>

          <!-- Confidence Score Bar -->
          <tr>
            <td style="padding:0 40px;background:#1e293b;">
              <div style="background:#0f172a;border-radius:12px;padding:20px;margin:24px 0 0;border:1px solid rgba(99,102,241,0.2);">
                <div style="display:flex;align-items:center;margin-bottom:10px;">
                  <span style="font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">AI Match Confidence</span>
                  <span style="margin-left:auto;font-size:22px;font-weight:800;color:${scoreColor};">${score}%</span>
                </div>
                <div style="background:#1e293b;border-radius:999px;height:8px;overflow:hidden;">
                  <div style="width:${score}%;height:100%;background:linear-gradient(90deg,#4f46e5,${scoreColor});border-radius:999px;"></div>
                </div>
              </div>
            </td>
          </tr>

          <!-- Item Comparison -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Your Lost Item -->
                  <td width="47%" style="background:#0f172a;border-radius:14px;padding:18px;vertical-align:top;border:1px solid rgba(239,68,68,0.3);">
                    <div style="font-size:10px;font-weight:700;color:#f87171;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">📋 Your Lost Report</div>
                    <div style="font-size:15px;font-weight:700;color:#f1f5f9;margin-bottom:6px;">${lostRep.title}</div>
                    <div style="font-size:12px;color:#94a3b8;margin-bottom:4px;">📍 ${lostRep.location_name}</div>
                    <div style="font-size:12px;color:#94a3b8;">🕐 ${lostDate}</div>
                  </td>

                  <!-- Arrow -->
                  <td width="6%" style="text-align:center;vertical-align:middle;font-size:24px;color:#6366f1;padding:0 4px;">⇌</td>

                  <!-- Found Item -->
                  <td width="47%" style="background:#0f172a;border-radius:14px;padding:18px;vertical-align:top;border:1px solid rgba(34,197,94,0.3);">
                    <div style="font-size:10px;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;">✅ Matched Found Item</div>
                    <div style="font-size:15px;font-weight:700;color:#f1f5f9;margin-bottom:6px;">${foundRep.title}</div>
                    <div style="font-size:12px;color:#94a3b8;margin-bottom:4px;">📍 ${foundRep.location_name}</div>
                    <div style="font-size:12px;color:#94a3b8;">🙋 Finder: ${foundRep.contact_name || 'Anonymous'}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- AI Explanation -->
          ${match.explanation ? `
          <tr>
            <td style="padding:20px 40px 0;">
              <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:14px;padding:18px;">
                <div style="font-size:11px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">✨ AI Match Explanation</div>
                <p style="color:#c7d2fe;font-size:13px;line-height:1.7;margin:0;">${match.explanation}</p>
              </div>
            </td>
          </tr>` : ''}

          <!-- Contact Info Box -->
          <tr>
            <td style="padding:24px 40px 0;">
              <div style="background:#0f172a;border-radius:14px;padding:24px;border:1px solid rgba(34,197,94,0.3);">
                <h3 style="color:#4ade80;font-size:15px;font-weight:700;margin:0 0 16px;">📨 How to Retrieve Your Item</h3>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size:13px;color:#94a3b8;padding-bottom:8px;">Finder's Name:</td>
                    <td style="font-size:13px;color:#f1f5f9;font-weight:600;text-align:right;padding-bottom:8px;">${foundRep.contact_name || 'Anonymous'}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#94a3b8;padding-bottom:8px;">Finder's Email:</td>
                    <td style="text-align:right;padding-bottom:8px;"><a href="mailto:${foundRep.contact_email}" style="color:#818cf8;font-size:13px;font-weight:600;text-decoration:none;">${foundRep.contact_email || 'N/A'}</a></td>
                  </tr>
                  ${foundRep.contact_phone ? `<tr>
                    <td style="font-size:13px;color:#94a3b8;">Finder's Phone:</td>
                    <td style="font-size:13px;color:#f1f5f9;font-weight:600;text-align:right;">${foundRep.contact_phone}</td>
                  </tr>` : ''}
                </table>
                <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
                  <p style="color:#64748b;font-size:12px;margin:0;">💡 Tip: Contact the finder directly to arrange a safe handoff. Always meet in a public campus location.</p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);margin-top:24px;">
              <div style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:999px;padding:2px;">
                <div style="background:#1e293b;border-radius:999px;padding:6px 16px;">
                  <span style="color:#a5b4fc;font-size:13px;font-weight:700;">✦ ApexMatch</span>
                  <span style="color:#475569;font-size:13px;"> · AI Campus Lost & Found</span>
                </div>
              </div>
              <p style="color:#334155;font-size:12px;margin:16px 0 0;">This email was automatically generated when a match was confirmed. If you believe this is in error, please contact campus security.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildFinderEmail({ lostRep, foundRep, match }) {
  const score = Math.round(match.confidence_score);
  const foundDate = new Date(foundRep.date_time).toLocaleString();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thank You — Your Found Item Report Made a Difference!</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid rgba(34,197,94,0.3);box-shadow:0 25px 50px rgba(0,0,0,0.4);">

          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#065f46 0%,#047857 50%,#059669 100%);padding:40px 40px 30px;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">🌟</div>
              <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 8px;letter-spacing:-0.5px;">You're a Campus Hero!</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0;">Your found item report has been matched with <strong>${score}% confidence</strong> to its owner</p>
            </td>
          </tr>

          <!-- Thank you box -->
          <tr>
            <td style="padding:24px 40px 0;">
              <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:14px;padding:20px;text-align:center;">
                <p style="color:#86efac;font-size:14px;line-height:1.7;margin:0;">Thank you for turning in <strong style="color:#4ade80;">"${foundRep.title}"</strong>. Our AI system matched it with the person who reported it missing.</p>
              </div>
            </td>
          </tr>

          <!-- Match Details -->
          <tr>
            <td style="padding:24px 40px 0;">
              <div style="background:#0f172a;border-radius:14px;padding:20px;border:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">Match Details · ${score}% Confidence</div>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size:13px;color:#94a3b8;padding-bottom:10px;">Your Report:</td>
                    <td style="font-size:13px;color:#f1f5f9;font-weight:600;text-align:right;padding-bottom:10px;">${foundRep.title}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#94a3b8;padding-bottom:10px;">Where Found:</td>
                    <td style="font-size:13px;color:#f1f5f9;text-align:right;padding-bottom:10px;">${foundRep.location_name}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#94a3b8;">Matched Lost Report:</td>
                    <td style="font-size:13px;color:#a5b4fc;font-weight:600;text-align:right;">${lostRep.title}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Owner Contact Info -->
          <tr>
            <td style="padding:20px 40px 0;">
              <div style="background:#0f172a;border-radius:14px;padding:24px;border:1px solid rgba(99,102,241,0.3);">
                <h3 style="color:#818cf8;font-size:15px;font-weight:700;margin:0 0 16px;">📨 Owner's Contact Information</h3>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size:13px;color:#94a3b8;padding-bottom:8px;">Owner's Name:</td>
                    <td style="font-size:13px;color:#f1f5f9;font-weight:600;text-align:right;padding-bottom:8px;">${lostRep.contact_name || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#94a3b8;padding-bottom:8px;">Owner's Email:</td>
                    <td style="text-align:right;padding-bottom:8px;"><a href="mailto:${lostRep.contact_email}" style="color:#818cf8;font-size:13px;font-weight:600;text-decoration:none;">${lostRep.contact_email || 'N/A'}</a></td>
                  </tr>
                  ${lostRep.contact_phone ? `<tr>
                    <td style="font-size:13px;color:#94a3b8;">Owner's Phone:</td>
                    <td style="font-size:13px;color:#f1f5f9;font-weight:600;text-align:right;">${lostRep.contact_phone}</td>
                  </tr>` : ''}
                </table>
                <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
                  <p style="color:#64748b;font-size:12px;margin:0;">💡 Please arrange a safe handoff in a well-lit public campus area.</p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);margin-top:24px;">
              <div style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:999px;padding:2px;">
                <div style="background:#1e293b;border-radius:999px;padding:6px 16px;">
                  <span style="color:#a5b4fc;font-size:13px;font-weight:700;">✦ ApexMatch</span>
                  <span style="color:#475569;font-size:13px;"> · AI Campus Lost & Found</span>
                </div>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send match confirmation emails to both the person who lost the item
 * and the person who found it.
 * Also generates 1-click Direct Gmail Compose URLs for each.
 */
export async function sendMatchConfirmationEmails({ lostRep, foundRep, match }) {
  const transport = getTransporter();
  const results = { sent: [], skipped: [], errors: [], directGmailLinks: [] };
  const fromName = 'ApexMatch Campus Lost & Found';
  const fromAddr = currentGmailUser || process.env.GMAIL_USER || 'noreply@campus.edu';

  // ── Plain text templates for direct Gmail links ───────────────────────────
  const plainTextLost = `Hello ${lostRep.contact_name || 'there'},\n\nGreat news! Your lost item "${lostRep.title}" was confirmed matched (${Math.round(match.confidence_score)}% confidence) with a found report turned in by ${foundRep.contact_name || 'a fellow student'} (${foundRep.contact_email}).\n\nFound Item: ${foundRep.title}\nLocation: ${foundRep.location_name}\n\nPlease reach out directly to arrange a safe retrieval on campus.\n\n— ApexMatch Campus Lost & Found`;

  const plainTextFinder = `Hello ${foundRep.contact_name || 'there'},\n\nThank you for turning in "${foundRep.title}". It has been matched to its owner, ${lostRep.contact_name || 'Item Owner'} (${lostRep.contact_email}).\n\nThey have been notified to contact you for a safe campus handoff.\n\n— ApexMatch Campus Lost & Found`;

  // ── Email 1: To the person who LOST the item ──────────────────────────────
  if (lostRep?.contact_email) {
    const subject = `🎉 Match Confirmed: Your Lost "${lostRep.title}" has been found!`;
    const html = buildLostPersonEmail({ lostRep, foundRep, match });
    const directLink = buildDirectGmailLink({ to: lostRep.contact_email, subject, bodyText: plainTextLost });

    results.directGmailLinks.push({
      recipient: lostRep.contact_email,
      role: 'lost_person',
      name: lostRep.contact_name,
      subject,
      url: directLink
    });

    const logEntry = {
      id: Date.now() + '-lost',
      timestamp: new Date().toISOString(),
      to: lostRep.contact_email,
      role: 'lost_person',
      subject,
      itemTitle: lostRep.title,
      directGmailUrl: directLink,
      status: 'pending'
    };

    if (transport) {
      try {
        const info = await transport.sendMail({
          from: `"${fromName}" <${fromAddr}>`,
          to: lostRep.contact_email,
          subject,
          html,
          text: plainTextLost
        });
        logEntry.status = 'sent';
        logEntry.messageId = info.messageId;
        results.sent.push({ to: lostRep.contact_email, role: 'lost_person', messageId: info.messageId });
        console.log(`📧 ✅ Real Gmail sent to LOST person: ${lostRep.contact_email}`);
      } catch (err) {
        logEntry.status = 'error';
        logEntry.error = err.message;
        results.errors.push({ to: lostRep.contact_email, role: 'lost_person', error: err.message });
        console.error(`📧 ❌ Failed to send to ${lostRep.contact_email}:`, err.message);
      }
    } else {
      logEntry.status = 'logged_console';
      results.skipped.push({ to: lostRep.contact_email, role: 'lost_person', reason: 'no_credentials' });
      console.log(`📧 [DISPATCH READY] Notification generated for LOST person: ${lostRep.contact_email}`);
    }

    emailLogs.unshift(logEntry);
  }

  // ── Email 2: To the person who FOUND the item ─────────────────────────────
  if (foundRep?.contact_email) {
    const subject = `🌟 Thank You! Your Found Item Report Matched "${lostRep?.title}"`;
    const html = buildFinderEmail({ lostRep, foundRep, match });
    const directLink = buildDirectGmailLink({ to: foundRep.contact_email, subject, bodyText: plainTextFinder });

    results.directGmailLinks.push({
      recipient: foundRep.contact_email,
      role: 'finder',
      name: foundRep.contact_name,
      subject,
      url: directLink
    });

    const logEntry = {
      id: Date.now() + '-found',
      timestamp: new Date().toISOString(),
      to: foundRep.contact_email,
      role: 'finder',
      subject,
      itemTitle: foundRep.title,
      directGmailUrl: directLink,
      status: 'pending'
    };

    if (transport) {
      try {
        const info = await transport.sendMail({
          from: `"${fromName}" <${fromAddr}>`,
          to: foundRep.contact_email,
          subject,
          html,
          text: plainTextFinder
        });
        logEntry.status = 'sent';
        logEntry.messageId = info.messageId;
        results.sent.push({ to: foundRep.contact_email, role: 'finder', messageId: info.messageId });
        console.log(`📧 ✅ Real Gmail sent to FINDER: ${foundRep.contact_email}`);
      } catch (err) {
        logEntry.status = 'error';
        logEntry.error = err.message;
        results.errors.push({ to: foundRep.contact_email, role: 'finder', error: err.message });
        console.error(`📧 ❌ Failed to send to ${foundRep.contact_email}:`, err.message);
      }
    } else {
      logEntry.status = 'logged_console';
      results.skipped.push({ to: foundRep.contact_email, role: 'finder', reason: 'no_credentials' });
      console.log(`📧 [DISPATCH READY] Notification generated for FINDER: ${foundRep.contact_email}`);
    }

    emailLogs.unshift(logEntry);
  }

  return {
    success: results.errors.length === 0,
    ...results
  };
}

/**
 * Send a test email to verify Gmail SMTP configuration.
 */
export async function sendTestEmail(toAddress) {
  const transport = getTransporter();
  if (!transport) {
    return {
      success: false,
      error: 'Gmail credentials not configured. Please enter your Gmail address and 16-character Google App Password.'
    };
  }

  try {
    const fromAddr = currentGmailUser || process.env.GMAIL_USER;
    const info = await transport.sendMail({
      from: `"ApexMatch Campus Lost & Found" <${fromAddr}>`,
      to: toAddress,
      subject: '✅ ApexMatch Email Test — Connected & Ready!',
      html: `
        <div style="background:#0f172a;padding:36px;border-radius:16px;font-family:sans-serif;color:#f1f5f9;max-width:550px;margin:auto;border:1px solid #6366f1;">
          <h2 style="color:#818cf8;margin-top:0;">✅ Gmail Notification Service Connected!</h2>
          <p style="color:#cbd5e1;line-height:1.6;">Your ApexMatch Lost &amp; Found email dispatcher is active. Whenever a lost or found item match is confirmed, automated emails will be delivered directly to the submitters' Gmail addresses.</p>
          <div style="background:#1e293b;padding:16px;border-radius:10px;margin:20px 0;font-size:13px;color:#94a3b8;">
            <div>Sender Account: <strong>${fromAddr}</strong></div>
            <div>Test Recipient: <strong>${toAddress}</strong></div>
            <div>Timestamp: <strong>${new Date().toLocaleString()}</strong></div>
          </div>
          <p style="color:#64748b;font-size:12px;margin-bottom:0;">ApexMatch · AI-Powered Smart Campus Lost &amp; Found</p>
        </div>
      `
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function getEmailLogs() {
  return emailLogs.slice(0, 30);
}

export const EmailService = {
  sendMatchConfirmationEmails,
  sendTestEmail,
  updateCredentials,
  getConfigStatus,
  getEmailLogs,
  buildDirectGmailLink
};
