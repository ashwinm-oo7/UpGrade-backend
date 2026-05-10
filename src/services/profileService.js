import User from "../models/user.js";
import Exam from "../models/Exam.js";

export const getUserProfileService = async (username) => {
  const user = await User.findById({ _id: username }).lean();

  if (!user) {
    throw new Error("User not found");
  }

  const certificates = await Exam.find({
    user: user._id,
    certificateEligible: true,
  })
    .select("domain level percentage certificateIssuedAt")
    .lean();

  const domainsCompleted = [...new Set(certificates.map((c) => c.domain))];

  const avgScore =
    certificates.reduce((acc, c) => acc + c.percentage, 0) /
    (certificates.length || 1);

  return {
    name: user.name,
    email: user.email,
    certificates,
    domainsCompleted,
    avgScore: Math.round(avgScore),
  };
};
