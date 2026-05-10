import Exam from "../models/Exam.js";
import { generateCertificate } from "../utils/pdfCertificate.js";

export const downloadCertificateService = async (req, res) => {
  const { domain, level } = req.params;
  const { preview } = req.query; // 👈 NEW

  const exam = await Exam.findOne({
    user: req.user._id,
    domain,
    level: Number(level),
    certificateEligible: true,
  });

  if (!exam) {
    return res.status(403).json({
      message: "Certificate not available",
    });
  }
  const disposition = preview === "true" ? "inline" : "attachment";

  res.setHeader(
    "Content-Disposition",
    `${disposition}; filename=certificate-${exam.domain}-L${exam.level}.pdf`,
  );

  res.setHeader("Content-Type", "application/pdf");

  generateCertificate(res, req.user, exam);
};
