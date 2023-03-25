export interface OpenApiDocument {
    paths?: Paths;
    definitions?: Definitions;
    components?: {
        schemas?: Definitions;
    }
};

export interface Paths {
    [path: string]: {
        [methodType: string]: Method;
    }
};

export interface Definitions {
    [schemaName: string]: Schema;
};

export interface Schema {
    type?: Type;
    enum?: string[];
    items?: Schema;
    properties?: {
        [propName: string]: Schema
    };
    required?: string[];
    $ref?: string;
};

export interface Method {
    operationId: string;
    parameters?: MethodParameter[];
    requestBody?: {
        required?: boolean;
        content: {
            [mediaType: string]: {
                schema: Schema;
            };
        };
    };
    tags?: string[];
    responses?: {
        [code: string]: MethodResponse;
    };
    security?: Array<{ [header: string]: any[] }>;
};

export interface MethodResponse {
    description?: string;
    content?: {
        [mediaType: string]: {
            schema?: Schema;
        };
    };
    schema?: Schema;
};

export interface MethodParameter {
    name: string;
    enum?: string[];
    in: ParameterIn;
    type?: MethodParameterType;
    required?: boolean;
    schema?: Schema;
    default?: any;
    items?: {
        type?: Type;
        enum?: string[];
    }
    description?: string;
};

export type PrimitiveType = 'string' | 'number' | 'integer' | 'boolean';
export type FileType = 'file';
export type ArrayType = 'array';
export type ObjectType = 'object';
export type MethodParameterType = PrimitiveType | FileType | ArrayType;
export type Type = PrimitiveType | FileType | ArrayType | ObjectType;

export type ParameterIn = 'path' | 'query' | 'body' | 'formData';

export type RequestContentType = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data';
