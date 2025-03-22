import { Prisma } from '@prisma/client';

export const auditExtension = Prisma.defineExtension({
    query: {
        async $allOperations({ operation, model, args, query }) {
        // Ejecutamos la operación original
        const result = await query(args);

        // Solo registramos auditoría para create, update y delete
        if (['create', 'update', 'delete'].includes(operation)) {
            const auditLog = {
                action: operation,
                model: model,
                recordId: args.where?.id || result?.id, // ID del registro afectado
                userId: (args as any)?.currentUser?.id, // Obtenemos el usuario desde los argumentos
                details: operation === 'update' ? args.data : null, // Detalles si es update
                timestamp: new Date(),
            };

            // Guardamos el registro de auditoría
            // Nota: Aquí usamos el cliente Prisma desde la propia extensión
            await this.auditLog.create({ data: auditLog });
        }

        return result;
        },
    },
});