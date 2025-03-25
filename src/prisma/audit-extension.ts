import { Prisma } from '@prisma/client';

export const auditExtension = Prisma.defineExtension(( client ) => (
    client.$extends({
        query: {
            async $allOperations({ operation, model, args, query }) {
                const currentUserData   = ( args as any )?.data?.apiUserId;
                const currentUserWhere  = ( args as any )?.where?.apiUserId;
                const result            = await query( args );

                if (['create', 'update', 'delete', 'deleteMany'].includes( operation )) {
                    await client.auditLog.create({ data: {
                        action      : operation,
                        model       : model || '',
                        recordId    : args.where?.id || result?.id,
                        userId      : currentUserData || currentUserWhere,
                        details     : operation === 'update' ? args.data : null
                    }});
                }

                return result;
            },
        },
    })
));