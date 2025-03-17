import { ExecutionContext }     from "@nestjs/common";
import { GqlExecutionContext }  from "@nestjs/graphql";
import { AuthGuard }            from "@nestjs/passport";


class JwtAuthGuard extends AuthGuard( 'jwt' ) {

    constructor( private readonly access: boolean ) {
        super();
    }

    getRequest( context: ExecutionContext ) {
        const ctx = GqlExecutionContext.create( context );
        const req = ctx.getContext().req;

        req.access = this.access;

        return req;
    }

}

export const SecretAuthGuard = ( access: boolean ) => {
    return new JwtAuthGuard( access );
};
