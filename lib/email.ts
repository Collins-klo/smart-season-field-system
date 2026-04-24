import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInviteEmailOptions {
  to: string;
  inviteLink: string;
  inviterName?: string;
}

export async function sendInviteEmail({
  to,
  inviteLink,
  inviterName = "SmartSeason Admin",
}: SendInviteEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: "SmartSeason <onboarding@resend.dev>",
      to,
      subject: "You've been invited to join SmartSeason",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SmartSeason Invite</title>
</head>
<body style="margin:0;padding:0;background-color:#022c22;font-family:Nunito,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#022c22;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#053a2d;border-radius:16px;overflow:hidden;border:1px solid #065f46;">
          <!-- Header -->
          <tr>
            <td style="background-color:#064e3b;padding:32px 40px;border-bottom:1px solid #065f46;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:10px;">
                    <div style="width:32px;height:32px;background-color:#10b981;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                      <span style="color:#022c22;font-size:18px;font-weight:bold;line-height:32px;display:block;text-align:center;">🌿</span>
                    </div>
                  </td>
                  <td>
                    <span style="font-size:22px;font-weight:700;color:#fef3c7;letter-spacing:-0.3px;">SmartSeason</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#fef3c7;line-height:1.2;">
                You've been invited!
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#a7f3d0;line-height:1.6;">
                <strong style="color:#fef3c7;">${inviterName}</strong> has invited you to join the
                SmartSeason Field Monitoring System as a <strong style="color:#10b981;">Field Agent</strong>.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#a7f3d0;line-height:1.6;">
                Click the button below to set up your account. This invite link expires in
                <strong style="color:#fbbf24;">7 days</strong> and can only be used once.
              </p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background-color:#10b981;">
                    <a href="${inviteLink}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#022c22;text-decoration:none;border-radius:10px;">
                      Accept Invitation →
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Fallback link -->
              <p style="margin:28px 0 0;font-size:13px;color:#a7f3d0;line-height:1.6;">
                Or copy and paste this link into your browser:<br />
                <a href="${inviteLink}" style="color:#10b981;word-break:break-all;">${inviteLink}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #065f46;background-color:#022c22;">
              <p style="margin:0;font-size:12px;color:#a7f3d0;text-align:center;">
                © 2026 Shamba Records · SmartSeason Field Monitoring System<br />
                If you did not expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error("[RESEND_ERROR]", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[RESEND_EXCEPTION]", message);
    return { success: false, error: message };
  }
}
