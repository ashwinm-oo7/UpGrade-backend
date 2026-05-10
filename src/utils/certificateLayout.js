export const layout = {
  width: 842,
  height: 595,

  headerY: 80,
  badgeY: 220,
  nameY: 350,
  courseY: 430,
  metaY: 500,

  signatureX: 130,
  signatureY: 460,

  qrX: 700,
  qrY: 440,
};

export const drawMedal = (doc, x, y, badge) => {
  doc.circle(x, y, 45).fill(badge.color);

  doc.circle(x, y, 36).fill("#ffffff");

  doc.circle(x, y, 30).fill(badge.color);

  doc
    .fillColor("#fff")
    .fontSize(28)
    .text(badge.icon, x - 12, y - 16);
};
export const drawSeal = (doc, x, y) => {
  doc.circle(x, y, 34).fill("#caa64c");

  doc.circle(x, y, 28).fill("#e8c870");

  doc.circle(x, y, 20).fill("#caa64c");

  doc
    .fillColor("#fff")
    .fontSize(10)
    .text("MI", x - 7, y - 6);
};

export const drawInstituteLogo = (doc, x, y) => {
  doc.circle(x, y, 30).fill("#d4af37");

  doc.circle(x, y, 26).fill("#1a2b4c");

  doc
    .fillColor("#fff")
    .fontSize(14)
    .text("MI", x - 10, y - 8);
};

const drawGoldText = (doc, text, x, y) => {
  doc.fontSize(4);

  // Shadow layer (depth)
  doc.fillColor("#6b4e00").text(text, x + 0.6, y + 0.6, { lineBreak: false });

  // Dark gold layer
  doc.fillColor("#b88a00").text(text, x + 0.3, y + 0.3, { lineBreak: false });

  // Main gold
  doc.fillColor("#dba400").text(text, x, y, { lineBreak: false });

  // Highlight shine
  doc.fillColor("#ffe27a").text(text, x - 0.2, y - 0.2, { lineBreak: false });
};

export const drawGoldTextBorder = (doc, W, H) => {
  const text = `UpGrade Institute `;
  const borderThickness = 25;

  const textWidth = 60;
  const textHeight = 7;

  doc.fontSize(4).fillColor("#dba400");

  /*
  =========================
  SHADOW FRAME (3D DEPTH)
  =========================
  */

  doc
    .lineWidth(14)
    .strokeColor("#684b07")
    .rect(25, 25, W - 50, H - 50)
    .stroke();

  /*
  =========================
  MAIN GOLD FRAME
  =========================
  */

  doc
    .lineWidth(6)
    .strokeColor("#eab70f")
    .rect(25, 25, W - 50, H - 50)
    .stroke();

  /*
  =========================
  INNER LIGHT FRAME
  =========================
  */

  doc
    .lineWidth(2)
    .strokeColor("#f5e39e")
    .rect(40, 40, W - 80, H - 80)
    .stroke();

  /*
  =====================
  TOP BORDER
  =====================
  */

  for (let y = 23; y < borderThickness; y += textHeight) {
    for (let x = 100; x < W - 100; x += textWidth) {
      drawGoldText(doc, text, x, y);
    }
  }
  /*
  BOTTOM BORDER
  */
  const bottomStart = H - borderThickness - 2;
  const bottomEnd = H - 23 - 2;

  for (let y = bottomStart; y < bottomEnd; y += textHeight) {
    for (let x = 100; x < W - 100; x += textWidth) {
      drawGoldText(doc, text, x, y);
    }
  }
  // left
  for (let x = 23; x < borderThickness; x += textHeight) {
    for (let y = 100; y < H - 100; y += textWidth) {
      doc.save();

      doc.rotate(-90, { origin: [x, y] });

      drawGoldText(doc, text, x, y);

      doc.restore();
    }
  }

  // Right Border
  for (let x = W - borderThickness + 2; x < W - 23 + 2; x += textHeight) {
    for (let y = 100; y < H - 100; y += textWidth) {
      doc.save();

      doc.rotate(90, { origin: [x, y] });

      drawGoldText(doc, text, x, y);

      doc.restore();
    }
  }
  doc.restore();
};
