import 'dotenv/config';
import * as joi from 'joi';


interface EnvVars {
    PORT                    : number;
    DATABASE_URL            : string;
    SECRET_SALT             : string;
    JWT_SECRET              : string;
    ROLE_SECRET             : string;
    SOCIAL_GOOGLE_AUTH      : string;
    SOCIAL_FACEBOOK_AUTH    : string;
    SOCIAL_GITHUB_AUTH      : string;
    SOCIAL_X_AUTH           : string;
    SOCIAL_TWITCH_AUTH      : string;
    FREE_PLAN_ID            : string;
}


const envsSchema = joi.object({
    PORT                    : joi.number().required(),
    DATABASE_URL            : joi.string().required(),
    SECRET_SALT             : joi.string().required(),
    JWT_SECRET              : joi.string().required(),
    ROLE_SECRET             : joi.string().required(),
    SOCIAL_GOOGLE_AUTH      : joi.string().required(),
    SOCIAL_FACEBOOK_AUTH    : joi.string().required(),
    SOCIAL_GITHUB_AUTH      : joi.string().required(),
    SOCIAL_X_AUTH           : joi.string().required(),
    SOCIAL_TWITCH_AUTH      : joi.string().required(),
    FREE_PLAN_ID            : joi.string().required(),
})
.unknown( true );


const { error, value } = envsSchema.validate( process.env );


if ( error ) throw new Error( `Config validation error: ${ error.message }` );


const envVars: EnvVars = value;


export const ENVS = {
    PORT                    : envVars.PORT,
    DATABASE_URL            : envVars.DATABASE_URL,
    SECRET_SALT             : envVars.SECRET_SALT,
    JWT_SECRET              : envVars.JWT_SECRET,
    ROLE_SECRET             : envVars.ROLE_SECRET,
    SOCIAL_GOOGLE_AUTH      : envVars.SOCIAL_GOOGLE_AUTH,
    SOCIAL_FACEBOOK_AUTH    : envVars.SOCIAL_FACEBOOK_AUTH,
    SOCIAL_GITHUB_AUTH      : envVars.SOCIAL_GITHUB_AUTH,
    SOCIAL_X_AUTH           : envVars.SOCIAL_X_AUTH,
    SOCIAL_TWITCH_AUTH      : envVars.SOCIAL_TWITCH_AUTH,
    FREE_PLAN_ID            : envVars.FREE_PLAN_ID,
}
