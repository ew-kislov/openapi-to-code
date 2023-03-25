/**
 * Generator interfaces
 */

export class GenerateClientFromOpenapiParams {
    pathToOpenApi: string;
    clientName: string;
    target: StackTarget;
    mode?: GenerationMode;
    securityParams?: ClientSecurityParams;
};

export type GenerationMode = 'basic' | 'api-gateway' | 'inter-microservice';

export interface ClientSecurityParams {
    apiKeysMapping?: { [headerName: string]: string };
    authorizationHeader?: string;
}

export type StackTarget = 'typescript-fetch' | 'nodejs-typescript-fetch';
