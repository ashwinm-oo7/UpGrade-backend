import Exam from "../models/Exam.js";
import User from "../models/user.js";
import {
  generateCertificate,
  generateCertificateMobile,
} from "../utils/pdfCertificate.js";

export const downloadCertificateService = async (req, res) => {
  const { domain, level, certificateId } = req.params;
  const userAgent = req.headers["user-agent"];
  const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
  //   const exam = await Exam.findOne({
  //     user: req.user._id,
  //     domain,
  //     level: Number(level),
  //     certificateEligible: true,
  //   });

  const exam = await Exam.findOne({
    certificateId,
    certificateEligible: true,
  }).populate({
    path: "user",
    select: "name email nameLocked",
    options: { lean: true },
  });
  // console.log("userdata", exam.user?.nameLocked);

  if (!exam.user?.nameLocked) {
    return res.status(400).json({
      msg: "Name must be locked before generating certificate",
    });
  }

  const userData = {
    name: exam.user?.name,
    email: exam.user?.email,
  };
  if (!exam) {
    return res.status(403).json({
      message: "Certificate not available",
    });
  }

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=certificate-${exam.domain}-L${exam.level}.pdf`,
  );

  res.setHeader("Content-Type", "application/pdf");

  // ✅ Call different generator
  if (isMobile) {
    console.log("📱 Mobile certificate");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=certificate-${exam.domain}-L${exam.level}.pdf`,
    );
    return generateCertificate(res, userData, exam);

    // return generateCertificateMobile(res, userData, exam);
  } else {
    console.log("🖥 Desktop certificate");
    return generateCertificate(res, userData, exam);
  }
};
