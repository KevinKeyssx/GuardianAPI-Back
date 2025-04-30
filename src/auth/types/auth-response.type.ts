import { User } from "@user/entities/user.entity";


export class AuthResponse {

    token   : string;
    user    : User;
    csrfToken?: string;

}