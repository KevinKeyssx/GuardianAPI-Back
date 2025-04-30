import { Request } from 'express';

declare module 'express' {
    interface Request {
        token?: string;
        secret?: string;
        access?: string;
    }
}