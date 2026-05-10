export const getOtpTemplate = (otp, email) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 0 10px rgba(0,0,0,0.08); padding: 30px; border: 1px solid #e5e5e5;">
    
    <div style="text-align: center;">
      <a href="${process.env.DeployLink}">
        <img src="https://mapacademy.io/wp-content/uploads/2025/01/mauryan-iconography-5M.jpg" alt="Maurya Logo" style="width: 100px; margin-bottom: 20px;" />
      </a>
    </div>

    <h2 style="color: #333; text-align: center;">Email Verification</h2>
    <p>Hello <strong>${email}</strong>,</p>

    <p>To complete your registration, please use the following One Time Password (OTP):</p>

    <div style="text-align: center; margin: 30px 0;">
      <span style="background-color: #f0f0f0; color: #2d3748; font-size: 24px; font-weight: bold; padding: 12px 30px; border-radius: 8px; display: inline-block; border: 1px dashed #ccc; cursor: pointer;" title="Tap to copy">${otp}</span>
      <p style="color: #888; font-size: 13px; margin-top: 8px;">(Tap and copy this code)</p>
    </div>

    <p>This OTP is valid for <strong>1 minutes</strong>. Please do not share it with anyone.</p>

    <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />

    <p style="font-size: 0.9em; color: #666;">If you did not request this, please ignore this email.</p>
    <p style="font-size: 0.9em; color: #999;">Thank you,<br/><strong>Maurya AI Team</strong></p>
  </div>
`;
