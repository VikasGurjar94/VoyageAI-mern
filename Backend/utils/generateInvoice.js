const PDFDocument = require("pdfkit");

const generateInvoice = (booking, res) => {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.pipe(res);

  // ── Header bar ────────────────────────────────────────────
  doc.fillColor("#1a1a2e").rect(0, 0, 612, 90).fill();

  doc
    .fillColor("#e94560")
    .fontSize(26)
    .font("Helvetica-Bold")
    .text("VOYAGE TOURS", 50, 28);

  doc
    .fillColor("#ffffff")
    .fontSize(10)
    .font("Helvetica")
    .text("Tours & Travel Management", 50, 60);

  doc
    .fillColor("#ffffff")
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("INVOICE", 460, 35);

  // ── Invoice meta ──────────────────────────────────────────
  doc
    .fillColor("#6b7280")
    .fontSize(10)
    .font("Helvetica")
    .text(`Invoice No  :  INV-${String(booking.id).padStart(6, "0")}`, 50, 110)
    .text(
      `Invoice Date:  ${new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
      50,
      128,
    )
    .text(`Booking ID  :  #${booking.id}`, 50, 146)
    .text(`Status      :  PAID`, 50, 164);

  // ── Divider ───────────────────────────────────────────────
  doc
    .strokeColor("#e5e7eb")
    .lineWidth(1)
    .moveTo(50, 186)
    .lineTo(562, 186)
    .stroke();

  // ── Bill To ───────────────────────────────────────────────
  doc
    .fillColor("#111827")
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Bill To:", 50, 200);
  doc
    .fillColor("#374151")
    .fontSize(10)
    .font("Helvetica")
    .text(booking.User?.name || "", 50, 218)
    .text(booking.User?.email || "", 50, 234)
    .text(booking.User?.phone || "", 50, 250);

  // ── Tour Details ──────────────────────────────────────────
  doc
    .fillColor("#111827")
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Tour Details:", 320, 200);
  doc
    .fillColor("#374151")
    .fontSize(10)
    .font("Helvetica")
    .text(booking.Tour?.title || "", 320, 218)
    .text(`Destination: ${booking.Tour?.destination || ""}`, 320, 234)
    .text(`Duration   : ${booking.Tour?.duration_days || ""} days`, 320, 250);

  // ── Table Header ──────────────────────────────────────────
  doc.fillColor("#1a1a2e").rect(50, 290, 512, 36).fill();
  doc
    .fillColor("#ffffff")
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Description", 70, 305)
    .text("Travel Date", 260, 305)
    .text("Travelers", 370, 305)
    .text("Amount", 460, 305);

  // ── Table Row ─────────────────────────────────────────────
  doc.fillColor("#f9fafb").rect(50, 326, 512, 40).fill();
  doc
    .fillColor("#374151")
    .fontSize(10)
    .font("Helvetica")
    .text(booking.Tour?.title || "", 70, 342, { width: 180 })
    .text(
      new Date(booking.travel_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      260,
      342,
    )
    .text(
      `${booking.num_people} person${booking.num_people > 1 ? "s" : ""}`,
      370,
      342,
    )
    .text(
      `Rs. ${Number(booking.total_price).toLocaleString("en-IN")}`,
      460,
      342,
    );

  // ── Special requests ──────────────────────────────────────
  const notesY = booking.special_requests ? 386 : 376;
  if (booking.special_requests) {
    doc
      .fillColor("#6b7280")
      .fontSize(9)
      .font("Helvetica")
      .text(`Special Requests: ${booking.special_requests}`, 70, 372, {
        width: 480,
      });
  }

  // ── Totals ────────────────────────────────────────────────
  const totalY = notesY + 14;
  doc
    .strokeColor("#e5e7eb")
    .lineWidth(1)
    .moveTo(350, totalY)
    .lineTo(562, totalY)
    .stroke();

  doc
    .fillColor("#6b7280")
    .fontSize(10)
    .font("Helvetica")
    .text("Subtotal:", 350, totalY + 14)
    .text(
      `Rs. ${Number(booking.total_price).toLocaleString("en-IN")}`,
      460,
      totalY + 14,
    )
    .text("Tax (0%):", 350, totalY + 32)
    .text("Rs. 0", 460, totalY + 32);

  doc
    .fillColor("#1a1a2e")
    .rect(350, totalY + 50, 212, 34)
    .fill();
  doc
    .fillColor("#ffffff")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Total Paid:", 360, totalY + 63);
  doc
    .fillColor("#e94560")
    .text(
      `Rs. ${Number(booking.total_price).toLocaleString("en-IN")}`,
      460,
      totalY + 63,
    );

  // ── PAID stamp ────────────────────────────────────────────
  doc
    .fillColor("#ecfdf5")
    .roundedRect(50, totalY + 14, 110, 36, 8)
    .fill();
  doc
    .fillColor("#059669")
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("PAID", 62, totalY + 26);

  // ── Footer ────────────────────────────────────────────────
  doc
    .strokeColor("#f3f4f6")
    .lineWidth(1)
    .moveTo(50, 694)
    .lineTo(562, 694)
    .stroke();
  doc
    .fillColor("#9ca3af")
    .fontSize(9)
    .font("Helvetica")
    .text(
      "Thank you for choosing Voyage Tours! We hope you have an amazing trip.",
      50,
      704,
      { align: "center", width: 512 },
    )
    .text("For support: support@voyage.com", 50, 720, {
      align: "center",
      width: 512,
    });

  doc.end();
};

module.exports = generateInvoice;
