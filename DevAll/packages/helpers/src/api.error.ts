export class APIError extends Error {
    constructor(
        public override message: string,
        public statusCode: number,
        public override name: string = 'APIError',
        public override stack?: string | undefined
    ) {
        super(message)

        if (!stack) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}