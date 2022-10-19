export interface DeskQueryParams {
    custom?: {
        dateFrom: string;
        dateTo: string;
        timeFrom: string;
        timeTo: string;
    };
    daily?: {
        timeFrom: string;
        timeTo: string;
    };
    weekly?: {
        weekDay: string;
        timeFrom: string;
        timeTo: string;
    }[];
}
