import { Inject, Injectable } from "@nestjs/common";
import { MailService } from "@sendgrid/mail";
import * as admin from "firebase-admin";
import { PushNotificationSendRequest } from "./contract/pushNotificationSendRequest";
import { EmailNotificationSendRequest } from "./contract/emailNotificationSendRequest";
import { INotificationService } from "./INotificationService";
import { SENDGRID_SERVICE } from "./ioc";

@Injectable()
export class NotificationService implements INotificationService {
    constructor(
        @Inject(SENDGRID_SERVICE)
        private readonly sgMail: MailService
    ) {
        admin.initializeApp();
    }

    async sendEmailNotification(body: EmailNotificationSendRequest): Promise<void> {
        try {
            await this.sgMail.send({
                from: process.env.EMAIL_SENDER,
                text: body.notificationText,
                html: `<p>${body.notificationText}</p>`,
                isMultiple: true,
                personalizations: body.recipients.map((email) => ({
                    to: email,
                    subject: body.notificationSubject
                }))
            });
        } catch (err) {
            throw err; //TODO: Implement error logging
        }
    }

    async sendPushNotification(request: PushNotificationSendRequest): Promise<void> {
        const { notificationSubject, notificationText, deviceToken, ...additional } = request;

        let message = {
            notification: {
                title: notificationSubject,
                body: notificationText
            },
            data: { ...additional }
        };

        try {
            if (request.deviceToken.length > 1) {
                await admin.messaging().sendMulticast({ ...message, tokens: deviceToken });
            } else {
                await admin.messaging().send({ ...message, token: deviceToken[0] });
            }
        } catch (err) {
            throw err;
        }
    }
}
