import { ICronService } from "../cron-service/ICronService";

export const mockCronService = (): ICronService => ({
    SendQuestionnaireScheduledNotifications: jest.fn()
});
