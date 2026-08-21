import logger from "./logger";

interface EmailPayload {
    to: string;
    subject: string;
    text: string;
}

// No email provider (Resend/SendGrid/SES) is configured yet. This logs the
// "sent" email instead of actually delivering it, so the rest of the app
// can be built against a real send/receive flow now. Swapping in a real
// provider later is a one-file change — every call site stays the same.
export const sendEmail = async ({ to, subject, text }: EmailPayload): Promise<void> => {
    logger.info({ to, subject, text }, "Email not sent — no provider configured, logging instead");
};
