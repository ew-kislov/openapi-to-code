export interface ParsedDocument {
    methods: ParsedMethod[];
    interfaces: ParsedInterface[];
}

export interface ParsedMethod {
    methodName: string;
    methodPath: string;
    methodType: MethodType;
    security: ParsedMethodSecurity;
    pathParams: ParsedMethodPathParams[];
    queryParams: string | null;
    body: { interface: string, type: RequestBodyType } | null;
    response: string | null;
};

export interface ParsedMethodPathParams {
    name: string;
    type: ParsedMethodPathParamType;
}

export interface ParsedMethodSecurity {
    authRequired: boolean;
    apiKeys: { [headerName: string]: string };
}

export type MethodType = 'get' | 'post' | 'patch' | 'put' | 'delete';
export type RequestBodyType = 'formData' | 'json';

export interface ParsedInterface {
    name: string;
    schema: ParsedSchema;
};

export interface ParsedSchema {
    inlineType?: ParsedType;
    customType?: string;
    enum?: string[]; // case inlineType === 'enum'
    properties?: {
        [key: string]: {
            required: boolean;
            schema: ParsedSchema;
        };
    }; // case inlineType === 'object'
    itemsSchema?: ParsedSchema; // case inlineType === 'array'
}

export type ParsedType = 'string' | 'number' | 'integer' | 'boolean' | 'file' | 'object' | 'array' | 'enum' | 'unknown';
export type ParsedMethodPathParamType = 'string' | 'number' | 'integer' | 'enum';
