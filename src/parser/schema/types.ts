export interface ParsedSchema {
    inlineType?: ParsedType;
    customType?: string;
    required: boolean;
    enum?: string[]; // case inlineType === 'enum'
    properties?: ParsedSchema[]; // case inlineType === 'object'
    itemsSchema?: ParsedSchema; // case inlineType === 'array'
}

export type ParsedType = 'string' | 'number' | 'integer' | 'boolean' | 'date' | 'file' | 'object' | 'array' | 'enum' | 'unknown';
