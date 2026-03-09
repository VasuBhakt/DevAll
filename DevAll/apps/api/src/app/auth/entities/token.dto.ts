export class TokenDTO {
    constructor(
        public token: string,
        public hashedToken: string,
        public ttl: Date
    ) {}
    
}