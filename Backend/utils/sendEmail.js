const nodemailer = require("nodemailer");

// create reusable transporter — connects to Gmail SMTP once
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── email templates ──────────────────────────────────────────

const templates = {
  // sent when user registers
  welcome: (name) => ({
    subject: "✈ Welcome to Voyage!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:40px 20px">
        <div style="background:#1a1a2e;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#e94560;margin:0;font-size:28px">✈ Voyage</h1>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px">
          <h2 style="color:#111827">Welcome aboard, ${name}! 🎉</h2>
          <p style="color:#6b7280;line-height:1.7">
            Your account has been created successfully. You can now browse and book
            from our collection of handpicked tours across India.
          </p>
          <a href="${process.env.CLIENT_URL}/tours"
            style="display:inline-block;background:#e94560;color:#fff;padding:12px 28px;
            border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">
            Explore Tours
          </a>
          <p style="color:#9ca3af;font-size:13px;margin-top:28px">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </div>
    `,
  }),

  // sent when booking is confirmed after payment
  bookingConfirmed: (booking) => ({
    subject: `✅ Booking Confirmed — ${booking.tourTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:40px 20px">
        <div style="background:#1a1a2e;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#e94560;margin:0;font-size:28px">✈ Voyage</h1>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px">
          <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center">
            <p style="color:#059669;font-weight:700;font-size:18px;margin:0">Booking Confirmed!</p>
          </div>
          <h2 style="color:#111827">Hi ${booking.customerName},</h2>
          <p style="color:#6b7280">Your booking has been confirmed. Here are your details:</p>

          <table style="width:100%;border-collapse:collapse;margin-top:20px">
            <tr style="background:#f9fafb">
              <td style="padding:12px 16px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6">Booking ID</td>
              <td style="padding:12px 16px;color:#111827;font-weight:600;font-size:14px;border-bottom:1px solid #f3f4f6">#${booking.bookingId}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6">Tour</td>
              <td style="padding:12px 16px;color:#111827;font-weight:600;font-size:14px;border-bottom:1px solid #f3f4f6">${booking.tourTitle}</td>
            </tr>
            <tr style="background:#f9fafb">
              <td style="padding:12px 16px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6">Destination</td>
              <td style="padding:12px 16px;color:#111827;font-weight:600;font-size:14px;border-bottom:1px solid #f3f4f6">📍 ${booking.destination}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6">Travel Date</td>
              <td style="padding:12px 16px;color:#111827;font-weight:600;font-size:14px;border-bottom:1px solid #f3f4f6">📅 ${booking.travelDate}</td>
            </tr>
            <tr style="background:#f9fafb">
              <td style="padding:12px 16px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6">People</td>
              <td style="padding:12px 16px;color:#111827;font-weight:600;font-size:14px;border-bottom:1px solid #f3f4f6">👥 ${booking.numPeople}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;color:#6b7280;font-size:14px">Amount Paid</td>
              <td style="padding:12px 16px;color:#e94560;font-weight:700;font-size:16px">₹${booking.totalPrice}</td>
            </tr>
          </table>

          <a href="${process.env.CLIENT_URL}/my-bookings"
            style="display:inline-block;background:#e94560;color:#fff;padding:12px 28px;
            border-radius:8px;text-decoration:none;font-weight:600;margin-top:24px">
            View My Bookings
          </a>
          <p style="color:#9ca3af;font-size:13px;margin-top:24px">
            You can download your invoice from the My Bookings page.
          </p>
        </div>
      </div>
    `,
  }),

  // sent when booking is cancelled
  bookingCancelled: (booking) => ({
    subject: `❌ Booking Cancelled — ${booking.tourTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:40px 20px">
        <div style="background:#1a1a2e;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:#e94560;margin:0;font-size:28px">✈ Voyage</h1>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px">
          <h2 style="color:#111827">Hi ${booking.customerName},</h2>
          <p style="color:#6b7280;line-height:1.7">
            Your booking <strong>#${booking.bookingId}</strong> for
            <strong>${booking.tourTitle}</strong> has been cancelled.
          </p>
          <p style="color:#6b7280;line-height:1.7">
            If you have any questions, feel free to contact our support team.
          </p>
          <a href="${process.env.CLIENT_URL}/tours"
            style="display:inline-block;background:#e94560;color:#fff;padding:12px 28px;
            border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">
            Browse Other Tours
          </a>
        </div>
      </div>
    `,
  }),
};

// ── main sendEmail function ──────────────────────────────────

const sendEmail = async (to, templateName, templateData) => {
  try {
    const template = templates[templateName](templateData);

    await transporter.sendMail({
      from: `"Voyage Tours" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });

    console.log(`Email sent: ${templateName} → ${to}`);
  } catch (error) {
    // log but don't crash the app if email fails
    console.error("Email send failed:", error.message);
  }
};

module.exports = sendEmail;
