export type JwtPayload = {
    username: string;
    id: string; // User ID
    role: string;
};

export type JwtPayloadWithRt = JwtPayload & { refreshToken: string };

export type Tokens = {
    access_token: string;
    refresh_token: string;
};
