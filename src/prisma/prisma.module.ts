import { Module, Global } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

import { auditExtension } from '@prisma/audit-extension';


@Global()
@Module({
    providers: [
        {
            provide     : 'PRISMA_CLIENT',
            useFactory  : () => {
                const prisma = new PrismaClient();
                return prisma.$extends(auditExtension);
            },
        },
    ],
    exports: ['PRISMA_CLIENT'],
})
export class PrismaModule {}
