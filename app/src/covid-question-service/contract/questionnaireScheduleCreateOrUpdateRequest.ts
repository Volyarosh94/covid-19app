export interface QuestionnaireScheduleCreateOrUpdateRequest {
    id: string;
    startTime: number;
    reminderTime: number;
    cancellationTime: number;
    isActive: boolean;
}
