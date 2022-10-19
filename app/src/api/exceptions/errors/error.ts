export interface ExtendedError extends Error {
    response: {
        error: string;
        message: string | string[];
        statusCode: number;
    };
}
