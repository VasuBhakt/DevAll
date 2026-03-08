import { BrevoClient } from "@getbrevo/brevo";
import { Injectable } from "@nestjs/common";

const brevoClient = new BrevoClient({
    apiKey: process.env['BREVO_API_KEY'] || 'brevo-key'
});

export interface EmailOptions {
    email: string;
    subject: string;
    message: string;
}

@Injectable()
export class MailService {

    sendEmail = async (options: EmailOptions) => {
        try {
            const response = await brevoClient.transactionalEmails.sendTransacEmail({
                sender: {
                    email: process.env.BREVO_FROM_EMAIL || 'no-reply@devall.com',
                    name: 'DevAll'
                },
                to: [{ email: options.email }],
                subject: options.subject,
                htmlContent: options.message
            });
            console.log(`Email sent successfully to ${options.email}. ID: ${response.messageId}`);
        } catch (error) {
            console.error("Brevo Error:", error);
            throw new Error("Email could not be sent");
        }
    }
}
