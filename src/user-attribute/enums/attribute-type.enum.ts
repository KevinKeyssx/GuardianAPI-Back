import { registerEnumType } from "@nestjs/graphql";

export enum AttributeType {
    STRING      = 'STRING',
    NUMBER      = 'NUMBER',
    BOOLEAN     = 'BOOLEAN',
    DECIMAL     = 'DECIMAL',
    LIST        = 'LIST',
    JSON        = 'JSON',
    DATETIME    = 'DATETIME',
    UUID        = 'UUID'
}


registerEnumType(AttributeType, {
    name: 'AttributeType',
    description: 'Tipos posibles de atributos',
});