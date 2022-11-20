/**
 * Generator interfaces
 */

export interface GenerateClientFromOpenapiParams {
    pathToOpenApi: string;
    clientName: string;
    target: StackTarget;
    mode: 'basic' | 'api-gateway' | 'inter-microservice'
    securityParams: ClientSecurityParams;
};

export interface ClientSecurityParams {
    apiKeysMapping: { [headerName: string]: string };
    authorizationHeader: string;
}

export type StackTarget = 'typescript-fetch' | 'nodejs-typescript-fetch';
