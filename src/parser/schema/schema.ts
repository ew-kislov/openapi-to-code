import { Schema } from '../../openapi-document';
import { ParsedSchema } from './types';

export function generateSchema(schema: Schema, required: boolean): ParsedSchema {
    if (isEnum(schema)) {
        return generateEnum(schema, required);
    } else if (isPrimitive(schema)) {
        return generatePrimitive(schema, required)
    } else if (isArray(schema)) {
        return generateArray(schema, required);
    } else if (isFile(schema)) {
        return generateFile(schema, required);
    } else if (isObject(schema)) {
        return generateObject(schema, required);
    } else if (isRef(schema)) {
        return generateReference(schema, required);
    } else if (isUntypedSchema(schema)) {
        return generateUntypedSchema(schema, required);
    } else {
        throw Error(`Could not determine type`);
    }
}

export function generateObject(definition: Schema, required: boolean): ParsedSchema {
    if (!definition.properties) {
        return { inlineType: 'object', required, properties: [] };
    }

    const properties = Object.entries(definition.properties!).map(([propName, prop]) => {
        const schema = generateSchema(prop, required);
        schema.required = definition.required ? definition.required.includes(propName) : false;
        return schema;
    });

    return {
        inlineType: 'object',
        required,
        properties
    };
}

export function generateEnum(schema: Schema, required: boolean): ParsedSchema {
    /**
     * NOTE:
     * This is generally must not be parsed because it is error corresponding to OpenAPI semantics.
     * But to make generator more accurate, we are parsing this case too.
     */
    if (schema.type === 'array') {
        return {
            inlineType: 'array',
            required,
            itemsSchema: { inlineType: 'enum', required: true, enum: schema.enum! }
        };
    } else {
        return { inlineType: 'enum', required, enum: schema.enum! };
    }
}

export function generateArray(schema: Schema, required: boolean): ParsedSchema {
    if (!schema.items) {
        return {
            inlineType: 'array',
            required,
            itemsSchema: { inlineType: 'unknown', required: true }
        };
    }

    return {
        inlineType: 'array',
        required,
        itemsSchema: generateSchema(schema.items, required)
    };
}

export function generateReference(schema: Schema, required: boolean): ParsedSchema {
    return { customType: schema.$ref!.split('/').pop() as string, required };
}

export function generatePrimitive(schema: Schema, required: boolean): ParsedSchema {
    return { inlineType: schema.type, required };
}

export function generateFile(schema: Schema, required: boolean): ParsedSchema {
    return { inlineType: 'file', required };
}

export function generateUntypedSchema(schema: Schema | null | undefined, required: boolean): ParsedSchema {
    return { inlineType: 'unknown', required };
}

// Type checkers


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
