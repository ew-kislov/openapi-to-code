/**
 * Generator interfaces
 */

export interface GenerateClientFromOpenapiParams {
    pathToOpenApi: string;
    clientName: string;
    target: StackTarget;
    securityParams: ClientSecurityParams;
};

export interface ClientSecurityParams {
    apiKeysMapping: { [headerName: string]: string };
    authorizationHeader: string;
}

export type StackTarget = 'typescript-fetch' | 'nodejs-typescript-fetch';

/**
 * OpenApi interfaces
 */

export interface OpenApiDocument {
    paths?: Paths;
    definitions?: Definitions;
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
    operationId?: string;
    parameters?: MethodParameter[];
    requestBody?: {
        required?: boolean;
        content: {
            [mediaType: string]: {
                schema: Schema;
            }
        };
    };
    responses: {
        [code: string]: MethodResponse;
    };
    security?: Array<{ [header: string]: any[] }>;
};

export interface MethodResponse {
    content?: {
        [mediaType: string]: {
            schema: Schema;
        };
    };
    schema?: Schema;
};

export interface MethodParameter {
    name: string;
    in: ParameterIn;
    type?: Type;
    required?: boolean;
    schema: Schema
};

export type PrimitiveType = 'string' | 'number' | 'integer' | 'boolean' | 'date';
export type FileType = 'file';
export type CompexType = 'object' | 'array';
export type Type = PrimitiveType | FileType | CompexType;

export type ParameterIn = 'path' | 'query' | 'body' | 'formData';
