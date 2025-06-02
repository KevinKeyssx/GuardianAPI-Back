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

export type AttributeTypeValue = 
    string | 
    number | 
    boolean | 
    object | 
    Date | 
    Array<string | number | boolean | object | Date> 


registerEnumType(AttributeType, {
    name: 'AttributeType',
    description: 'Tipos posibles de atributos',
});