import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { getBadge } from "./certificateBadge.js";

import path from "path";
import { fileURLToPath } from "url";
import { drawGoldTextBorder } from "./certificateLayout.js";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assets paths
const signaturePath = path.join(__dirname, "../assets/signature.png");
const logoPath = path.join(__dirname, "../assets/certificate-logo.png");
const certifiedPath = path.join(__dirname, "../assets/certified.png");
const cornerPath = path.join(__dirname, "../assets/DesignCorner.png");
import crypto from "crypto"; // top of file
const signatureBuffer = fs.readFileSync(signaturePath);
const logoBuffer = fs.readFileSync(logoPath);
const certifiedBuffer = fs.readFileSync(certifiedPath);
const cornerBuffer = fs.readFileSync(cornerPath);
export const generateCertificate = async (res, user, exam) => {
  const badge = getBadge(exam.level);

  const verifyUrl = `${process.env.DeployLink}/verify/${exam.certificateId}`;
  const text = "UpGrade INSTITUTE";
  const hashData = `${user.name}|${user.email}|${exam.certificateId}|${exam.domain}|${exam.level}|${exam.percentage}|${exam.certificateIssuedAt}`;

  // create SHA-256 hash
  const certificateHash = crypto
    .createHash("sha256")
    .update(hashData)
    .digest("hex");

  // Encode as JSON string and then to QR
  const qrImage = await QRCode.toDataURL(verifyUrl);

  // const qrImage = await QRCode.toDataURL(JSON.stringify(verifyPayload));
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 0,
  });

  res.setHeader(
    "Content-Disposition",
    `inline; filename=${exam.domain}-certificate.pdf`,
  );
  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);

  const W = 842;
  const H = 595;

  /* ===============================
     BACKGROUND
  =============================== */
  // base paper
  doc.rect(0, 0, W, H).fill("#fdfaf3");

  // subtle texture lines
  for (let i = 0; i < 30; i++) {
    doc
      .opacity(0.03)
      .moveTo(0, i * 20)
      .lineTo(W, i * 20)
      .stroke("#c6c3c3");
  }
  doc.opacity(1);
  /* ===============================
     BORDER
  =============================== */
  //   doc
  //     .lineWidth(10)
  //     .strokeColor("#f5b30b")
  //     .rect(25, 25, W - 50, H - 50)
  //     .stroke();

  // Example logic for a text-based border

  drawGoldTextBorder(doc, W, H);

  doc.save();
  /* ===============================
   SECURITY PATTERN (ANTI-COPY)
================================= */

  doc.save();

  doc.opacity(0.05);
  doc.lineWidth(0.5);

  // diagonal pattern
  for (let i = -H; i < W; i += 12) {
    doc
      .moveTo(i, 0)
      .lineTo(i + H, H)
      .stroke("#000");
  }

  // cross pattern (optional for stronger effect)
  doc.opacity(0.03);
  for (let i = 0; i < W + H; i += 15) {
    doc
      .moveTo(i, 0)
      .lineTo(i - H, H)
      .stroke("#434343");
  }

  doc.restore();
  /* ===============================
   CORNER ORNAMENTS
================================= */

  try {
    const size = 120;

    doc.save(); // ✅ save state
    doc.opacity(0.15); // 🔥 adjust here (0.1–0.2 is sweet spot)

    // TOP LEFT
    doc.image(cornerBuffer, 10, 9, {
      width: size,
    });

    // TOP RIGHT
    doc.save();
    doc.rotate(90, { origin: [W - size - 10, 0] });
    doc.image(cornerPath, W - size, -size, {
      width: size,
    });
    doc.restore();

    // BOTTOM LEFT
    doc.save();
    doc.rotate(-90, { origin: [0, H - size] });
    doc.image(cornerBuffer, -H + size + 365, H - size + 8, {
      width: size,
    });
    doc.restore();

    // BOTTOM RIGHT
    doc.save();
    doc.rotate(180, { origin: [W - size, H - size] });
    doc.image(cornerBuffer, W - size - 113, H - size - 110, {
      width: size,
    });
    doc.restore();

    doc.restore(); // ✅ restore opacity back to normal
  } catch (err) {
    console.log("Corner design not found");
  }
  // move origin to center
  //   doc.translate(842 / 2, 595 / 2);
  doc.translate(W / 2, H / 2);
  // rotate diagonally
  doc.rotate(-45);

  // repeat watermark text (marquee effect)

  doc.fontSize(15);
  doc.fillColor("#000");
  doc.opacity(0.04);

  for (let i = -600; i < 600; i += 120) {
    doc.text(text, -900, i, {
      width: 1800,
      align: "center",
    });
  }

  doc.restore();
  doc.opacity(1);
  /* ===============================
   CENTER LOGO WATERMARK (PRO)
=============================== */

  try {
    const wmSize = 300; // big size
    const wmX = (W - wmSize) / 2;
    const wmY = (H - wmSize) / 2;

    doc.save();

    // very light opacity (paper style)
    doc.opacity(0.06);

    // optional slight rotation for premium feel
    doc.rotate(0, { origin: [W / 2, H / 2] });

    doc.image(logoBuffer, wmX, wmY, {
      width: wmSize,
    });

    doc.restore();
    doc.opacity(1);
  } catch (err) {
    console.log("Watermark logo not found");
  }
  try {
    const issuedToText = `Issued To: ${user.name || user.email}`;
    const secretKey = process.env.CERT_SECRET || "default_secret_key";

    // simple AES encryption (hex output)
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      crypto.scryptSync(secretKey, "salt", 32),
      Buffer.alloc(16, 0),
    );
    let encrypted = cipher.update(issuedToText, "utf8", "hex");
    encrypted += cipher.final("hex");

    // draw the hidden text faintly
    doc.save();
    doc.opacity(0.05);
    doc.fontSize(14);
    doc.fillColor("#514f4f");
    doc.rotate(-30, { origin: [W / 1, H / 2] }); // diagonal
    // fill across page multiple times (like a repeating pattern)
    for (let i = -W; i < W; i += 200) {
      doc.text(encrypted, i, H / 4, {
        width: W,
        align: "center",
      });
    }

    doc.restore();
    doc.opacity(1);
  } catch (err) {
    console.log("Watermark logo not found");
  }

  /* ===============================
     LOGO (TOP CENTER)
  =============================== */

  try {
    const logoWidth = 100;
    const logoX = (W - logoWidth) / 2;

    doc.image(logoBuffer, logoX, 40, {
      width: logoWidth,
      height: 87,
    });
  } catch (err) {
    console.log("Logo not found, skipping");
  }

  /* ===============================
     DYNAMIC SPACING
  =============================== */

  let y = 130;

  const title = "UpGrade Institute";

  // ✅ correct center using page width
  const textWidth = doc.widthOfString(title);
  const centerX = (642 - textWidth) / 2;

  // 🔥 3D SHADOW (clean + HD)
  doc
    .fillColor("#0f172a")
    .fontSize(42)
    .text(title, centerX + 3, y + 3);

  doc.fillColor("#1e293b").text(title, centerX + 2, y + 2);

  doc.fillColor("#334155").text(title, centerX + 1, y + 1);

  // ✨ MAIN TEXT
  doc.fillColor("#2c3e50").text(title, centerX, y);

  // ✨ LIGHT SHINE
  doc
    .fillColor("#ffffff")
    .opacity(0.2)
    .text(title, centerX - 1, y - 1);

  doc.opacity(1);

  y += 43;
  /* TITLE */

  doc
    .fontSize(18)
    .fillColor("#686868")
    .text("Certificate of Achievement", 10, y, { align: "center" });

  y += 20;

  /* BADGE */

  const badgeBuffer = path.join(__dirname, "../assets", badge.image);
  const badgePath = fs.readFileSync(badgeBuffer);

  try {
    const badgeSize = 70;
    const badgeX = (W - badgeSize) / 2;

    // shadow (depth)
    doc.opacity(0.3);
    doc.image(badgePath, badgeX + 4, y + 1, {
      width: badgeSize,
    });

    // main badge
    doc.opacity(1);
    doc.image(badgePath, badgeX, y, {
      width: badgeSize,
    });
  } catch (err) {
    console.log("Badge image not found");
  }
  y += 70;

  doc
    .fillColor("#444")
    .fontSize(12)
    .text(badge.title, 0, y, { align: "center" });

  y += 35;

  /* NAME */

  doc.fontSize(18).text("This certificate is proudly presented to", 0, y, {
    align: "center",
  });

  y += 30;

  // name
  const name = user.name || user.email;

  // 3D shadow layers (bottom-right depth)
  doc
    .fillColor("#0d47a1") // dark shadow
    .fontSize(32)
    .text(name, 2, y + 2, { align: "center" });

  doc.fillColor("#6a6e72").text(name, 1, y + 1, { align: "center" });

  // MAIN TEXT (top layer)
  doc.fillColor("#ccced0").text(name, 0, y, { align: "center" });

  // subtle highlight (top-left shine)
  doc
    .fillColor("#0d0e0e")
    .fontSize(32)
    .text(name, -1, y - 1, { align: "center" });
  // name end

  y += 50;

  /* COURSE */

  doc.fillColor("#000").fontSize(18).text("for successfully completing", 0, y, {
    align: "center",
  });

  y += 30;

  doc
    .fillColor("#950909")
    .fontSize(24)
    .text(`${exam.domain} Level ${exam.level}`, 0, y, {
      align: "center",
    });

  y += 45;

  /* SCORE */

  doc
    .fontSize(14)
    .fillColor("#333")
    .text(`Score Achieved: ${exam.percentage}%`, 0, y, {
      align: "center",
    });

  y += 20;

  /* META */

  doc
    .fontSize(10)
    .fillColor("#666")
    .text(`Credential ID: ${exam.certificateId}`, 0, y, {
      align: "center",
    });

  y += 15;

  doc
    .fontSize(10)
    .fillColor("#666")
    .text(
      `Verify: ${process.env.DeployLink}/verify/${exam.certificateId}`,
      0,
      y,
      { align: "center" },
    );
  y += 15;

  doc.text(
    `Issued On: ${new Date(exam.certificateIssuedAt).toDateString()}`,
    0,
    y,
    { align: "center" },
  );

  /* ===============================
     FOOTER
  =============================== */

  const bottomY = H - 120;
  /* ===============================
     MICROTEXT SECURITY LINE
  =============================== */
  doc
    .fontSize(6)
    .opacity(0.4)
    .text(
      `UPGRADE-INSTITUTE-SECURE-CERTIFICATE-${exam.certificateId}-VERIFY-ONLINE`,
      50,
      H - 15,
    );

  doc.opacity(1);

  /* SIGNATURE */

  const sigX = 100;

  doc
    .moveTo(sigX, bottomY)
    .lineTo(sigX + 160, bottomY)
    .stroke();

  try {
    doc.save();
    doc.rotate(-2, { origin: [sigX, bottomY] });

    doc.image(signatureBuffer, sigX + 10, bottomY - 40, {
      width: 130,
    });

    doc.restore();
  } catch (err) {
    console.log("Signature not found");
  }

  doc
    .fontSize(25)
    .fillColor("#777")
    .text("Director", sigX + 35, bottomY + 10);

  /* SEAL */

  const sealX = 35;
  const sealY = H - 140;

  try {
    // soft shadow
    doc.opacity(0.25);
    doc.image(certifiedBuffer, sealX + 6, sealY + 6, {
      width: 85,
    });

    // real seal
    doc.opacity(1);
    doc.image(certifiedBuffer, sealX, sealY, {
      width: 85,
    });
  } catch (err) {
    console.log("Seal image not found");
  }
  /* QR CODE */

  const qrX = W - 140;

  doc.image(qrImage, qrX, bottomY - 30, {
    width: 80,
  });

  doc
    .fontSize(9)
    .fillColor("#444")
    .text("Scan to verify", qrX, bottomY + 55);
  /* ===============================
   TAMPER-PROOF HASH
================================= */

  // combine all important info
  // print hash in microtext somewhere unobtrusive
  doc
    .fontSize(6)
    .opacity(0.3)
    .fillColor("#333")
    .text(`CERT-HASH:${certificateHash}`, W - 300, H - 10);
  doc.end();
};

export const generateCertificateMobile = async (res, user, exam) => {
  res.setHeader(
    "Content-Disposition",
    `inline; filename=${exam.domain}-certificate-mobile.pdf`,
  );
  res.setHeader("Content-Type", "application/pdf");

  const doc = new PDFDocument({
    size: "A4",
    layout: "portrait",
    margin: 40,
  });

  doc.pipe(res);

  const W = 595;

  const displayName = user.name || "Certified Candidate";

  // Background
  doc.rect(0, 0, 595, 842).fill("#ffffff");

  // Logo
  try {
    doc.image(logoBuffer, W / 2 - 40, 40, { width: 80 });
  } catch {}

  doc.moveDown(3);

  // Title
  doc
    .fontSize(24)
    .fillColor("#222")
    .text("UpGrade Institute", { align: "center" });

  doc.moveDown(0.5);

  doc
    .fontSize(14)
    .fillColor("#555")
    .text("Certificate of Achievement", { align: "center" });

  doc.moveDown(1.5);

  // Divider
  doc
    .moveTo(100, doc.y)
    .lineTo(W - 100, doc.y)
    .stroke("#ccc");

  doc.moveDown(2);

  // Name
  doc.fontSize(20).fillColor("#000").text(displayName, { align: "center" });

  doc.moveDown(1);

  // Course
  doc
    .fontSize(14)
    .text(`Successfully completed ${exam.domain} Level ${exam.level}`, {
      align: "center",
    });

  doc.moveDown(1);

  // Score
  doc.fontSize(13).text(`Score: ${exam.percentage}%`, { align: "center" });

  doc.moveDown(1);

  // Date
  doc
    .fontSize(11)
    .fillColor("#666")
    .text(`Issued on: ${new Date(exam.certificateIssuedAt).toDateString()}`, {
      align: "center",
    });

  doc.moveDown(2);

  // QR
  const verifyUrl = `${process.env.DeployLink}/verify/${exam.certificateId}`;
  const qrImage = await QRCode.toDataURL(verifyUrl);

  doc.image(qrImage, W / 2 - 50, doc.y, { width: 100 });

  doc.moveDown(6);

  doc
    .fontSize(10)
    .fillColor("#666")
    .text(`Certificate ID: ${exam.certificateId}`, {
      align: "center",
    });

  doc.end();
};
