import { siteConfig } from '@/config/site';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export const EmailService = {
  /**
   * Development Mail Dispatcher
   * Logs verification and reset links cleanly to system logs.
   */
  async sendMail(options: SendMailOptions): Promise<{ success: boolean; devMode: boolean }> {
    console.log('\n------------------------------------------------------------');
    console.log(`✉️ [MARQIVO DEV MAIL DISPATCHER] To: ${options.to}`);
    console.log(`📌 Subject: ${options.subject}`);
    console.log(`📄 Message Body:\n${options.html}`);
    console.log('------------------------------------------------------------\n');

    return { success: true, devMode: true };
  },

  /**
   * Dispatch Customer Email Verification Link
   */
  async sendVerificationEmail(toEmail: string, rawToken: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/verify-email?token=${rawToken}`;

    const html = `
      <h2>Verify your MARQIVO Customer Account</h2>
      <p>Thank you for registering with ${siteConfig.name}. Please verify your email address to activate your account.</p>
      <p><a href="${verifyUrl}" style="background-color: #0D9488; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a></p>
      <p>Or copy this URL into your browser: <br /><code>${verifyUrl}</code></p>
      <p>This verification link will expire in 24 hours.</p>
    `;

    return await this.sendMail({
      to: toEmail,
      subject: `Verify your ${siteConfig.name} account`,
      html,
    });
  },

  /**
   * Dispatch Password Reset Instructions
   */
  async sendPasswordResetEmail(toEmail: string, rawToken: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    const html = `
      <h2>Reset your MARQIVO Password</h2>
      <p>We received a request to reset your password for ${siteConfig.name}.</p>
      <p><a href="${resetUrl}" style="background-color: #0F172A; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a></p>
      <p>Or copy this URL into your browser: <br /><code>${resetUrl}</code></p>
      <p>This link is single-use and will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
    `;

    return await this.sendMail({
      to: toEmail,
      subject: `Password Reset Request - ${siteConfig.name}`,
      html,
    });
  },
};
