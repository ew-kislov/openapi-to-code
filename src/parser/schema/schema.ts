import { Schema } from '../../openapi-document';
import { ParsedSchema } from '../types';

export function parseSchema(schema: Schema): ParsedSchema {
    if (isEnum(schema)) {
        return parseEnum(schema);
    } else if (isPrimitive(schema)) {
        return parsePrimitive(schema)
    } else if (isArray(schema)) {
        return parseArray(schema);
    } else if (isFile(schema)) {
        return parseFile();
    } else if (isObject(schema)) {
        return parseObject(schema);
    } else if (isRef(schema)) {
        return parseReference(schema);
    } else if (isUntypedSchema(schema)) {
        return parseUntypedSchema();
    } else {
        throw Error(`Could not determine type`);
    }
}

export function parseObject(definition: Schema): ParsedSchema {
    if (!definition.properties) {
        return { inlineType: 'object', properties: {} };
    }

    const propertiesAsEntries = Object.entries(definition.properties!).map(([propName, prop]) => {
        const schema = parseSchema(prop);
        const required = definition.required ? definition.required.includes(propName) : false;
        return [propName, { required, schema }];
    });

    return {
        inlineType: 'object',
        properties: Object.fromEntries(propertiesAsEntries)
    };
}

export function parseEnum(schema: Schema): ParsedSchema {
    /**
     * NOTE:
     * This is generally must not be parsed because it is error corresponding to OpenAPI semantics.
     * But to make generator more accurate, we are parsing this case too.
     */
    if (schema.type === 'array') {
        return {
            inlineType: 'array',
            itemsSchema: { inlineType: 'enum', enum: schema.enum! }
        };
    } else {
        return { inlineType: 'enum', enum: schema.enum! };
    }
}

export function parseArray(schema: Schema): ParsedSchema {
    if (!schema.items) {
        return {
            inlineType: 'array',
            itemsSchema: { inlineType: 'unknown' }
        };
    }

    return {
        inlineType: 'array',
        itemsSchema: parseSchema(schema.items)
    };
}

export function parseReference(schema: Schema): ParsedSchema {
    return { customType: schema.$ref!.split('/').pop() as string };
}

export function parsePrimitive(schema: Schema): ParsedSchema {
    return { inlineType: schema.type };
}

export function parseFile(): ParsedSchema {
    return { inlineType: 'file' };
}

export function parseUntypedSchema(): ParsedSchema {
    return { inlineType: 'unknown' };
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
