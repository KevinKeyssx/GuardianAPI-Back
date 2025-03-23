import { Prisma } from '@prisma/client';

export const auditExtension = Prisma.defineExtension({
    query: {
        async $allOperations({ operation, model, args, query }) {
            console.log(`Operación: ${operation}, Modelo: ${model}`); // Depuración

            // Ejecutamos la operación original
            const result = await query(args);

            // Solo registramos auditoría para create, update y delete
            if (['create', 'update', 'delete'].includes(operation)) {
                console.log('Registrando auditoría...'); // Depuración

                const auditLog = {
                    action: operation,
                    model: model,
                    recordId: args.where?.id || result?.id, // ID del registro afectado
                    userId: (args as any)?.currentUser?.id, // Obtenemos el usuario desde los argumentos
                    details: operation === 'update' ? args.data : null, // Detalles si es update
                    timestamp: new Date(),
                };

                console.log('AuditLog a guardar:', auditLog); // Depuración

                // Accedemos al modelo auditLog directamente desde el cliente Prisma
                await this.client.auditLog.create({ data: auditLog });
            }

            return result;
        },
    },
});