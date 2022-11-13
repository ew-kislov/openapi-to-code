import { Schema, PrimitiveType } from '../types';

export function generateSchema(schema: Schema) {
    if (isEnum(schema)) {
        return generateEnum(schema);
    } else if (isPrimitive(schema)) {
        return generatePrimitive(schema)
    } else if (isArray(schema)) {
        return generateArray(schema);
    } else if (isFile(schema)) {
        return generateFile(schema);
    } else if (isObject(schema)) {
        return generateObject(schema);
    } else if (isRef(schema)) {
        return generateReference(schema);
    } else if (isUntypedSchema(schema)) {
        return generateUntypedSchema(schema);
    } else {
        throw Error(`Could not determine type`);
    }
}

export function isRef(schema: Schema): boolean {
    return !!schema.$ref;
}

export function isEnum(schema: Schema): boolean {
    if (schema.enum && schema.type !== 'string') {
        console.warn(`(Warning) enum property should have "type": "string"`);
    }
    return !!schema.enum;
}

export function isPrimitive(schema: Schema): boolean {
    return !!schema.type && ['string', 'number', 'integer', 'boolean', 'date'].includes(schema.type);
}

export function isArray(schema: Schema) {
    return schema.type === 'array';
}

export function isFile(schema: Schema): boolean {
    return schema.type === 'file';
}

export function isObject(schema: Schema): boolean {
    return schema.type === 'object';
}

export function isUntypedSchema(schema: Schema): boolean {
    return !schema.type;
}

export function generateObject(definition: Schema): string {
    if (!definition.properties) {
        return '{}';
    }
    const propCodes = Object.entries(definition.properties!).map(([propName, prop]) => {
        const typeCode = generateSchema(prop);
        const required = definition.required ? definition.required.includes(propName) : false;

        return `${propName}${required ? '' : '?'}: ${typeCode}`;
    });

    return `{ ` + propCodes.join('; ') + ' }';
}

export function generateEnum(schema: Schema): string {
    /**
     * NOTE:
     * This is generally must not be parsed because it is error corresponding to OpenAPI semantics.
     * But to make generator more accurate, we are parsing this case too.
     */
    if (schema.type === 'array') {
        return 'Array<' + schema.enum!.map((enumItem) => `'${enumItem}'`).join(' | ') + '>';
    } else {
        return schema.enum!.map((enumItem) => `'${enumItem}'`).join(' | ');
    }
}

export function generateArray(schema: Schema): string {
    if (!schema.items) {
        return `Array<${schema.items}>`;
    }

    return `Array<${generateSchema(schema.items)}>`;
}

export function generateReference(schema: Schema): string {
    return schema.$ref!.split('/').pop() as string;
}

export function generatePrimitive(schema: Schema): string {
    const mapping = {
        string: 'string',
        number: 'number',
        integer: 'number',
        boolean: 'boolean',
        date: 'string'
    }

    return mapping[schema.type as PrimitiveType];
}

export function generateFile(schema: Schema): string {
    return 'File';
}

export function generateUntypedSchema(schema: Schema | null | undefined) {
    return 'unknown';
}
