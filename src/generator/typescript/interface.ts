import { ParsedInterface, ParsedSchema } from "../../parser";

export function generateInterfacesCode(interfaces: ParsedInterface[]): string[] {
    return interfaces.map((item) => generateInterfaceCode(item));
}

export function generateInterfaceCode(item: ParsedInterface): string {
    return `export interface ${item.name} ${generateObjectSchema(item.schema)}`;
}

function generateSchemaCode(schema: ParsedSchema): string {
    if (schema.customType) {
        return generateCustomTypeSchema(schema);
    } else if (['string', 'number', 'integer', 'boolean', 'date', 'file', 'unknown'].includes(schema.inlineType!)) {
        return generatePrimitiveSchema(schema);
    } else if (schema.inlineType === 'enum') {
        return generateEnumSchema(schema);
    } else if (schema.inlineType === 'object') {
        return generateObjectSchema(schema);
    } else if (schema.inlineType === 'array') {
        return generateArraySchema(schema);
    } else {
        throw Error('Generation error: unknown schema type');
    }
}

function generateCustomTypeSchema(schema: ParsedSchema): string {
    return schema.customType!;
}

function generatePrimitiveSchema(schema: ParsedSchema): string {
    const primitivesMapping: { [key: string]: string } = {
        'string': 'string',
        'number': 'number',
        'integer': 'number',
        'boolean': 'boolean',
        'date': 'string',
        'file': 'File',
        'unknown': 'unknown'
    };

    return primitivesMapping[schema.inlineType!];
}

function generateEnumSchema(schema: ParsedSchema): string {
    return schema.enum!.map((item) => `'${item}'`).join(' | ');
}

function generateObjectSchema(schema: ParsedSchema): string {
    const propStrings = Object.entries(schema.properties!).map(([name, prop]) =>
        `${name}${prop.required ? '' : '?'}: ${generateSchemaCode(prop.schema)}`
    );

    return `{ ${propStrings.join(';')} }`;
}

function generateArraySchema(schema: ParsedSchema): string {
    return `Array<${generateSchemaCode(schema.itemsSchema!)}>`;
}