import { ClientSecurityParams, Method } from "../types";

export interface GenerateSecurityResult {
    authHeaderName: string | null;
    apiKeys: { [headerName: string]: string };
}

export function generateSecurity(method: Method, securityParams: ClientSecurityParams): GenerateSecurityResult {
    if (!method.security || method.security.length === 0) {
        return {
            authHeaderName: null,
            apiKeys: {}
        };
    }

    const expectedHeaders = Object.keys(securityParams.apiKeysMapping);
    const securityHeaders = method.security.flatMap((headerRaw) => Object.keys(headerRaw));

    securityHeaders.forEach((header) => {
        if (header !== securityParams.authorizationHeader && !expectedHeaders.includes(header)) {
            throw Error(`Found security header '${header}' which is not mentonied in generator parameters.`);
        }
    });

    const authRequired = !!securityHeaders.find((header) => header === securityParams.authorizationHeader);
    const apiKeys = Object.fromEntries(
        Object.entries(securityParams.apiKeysMapping).filter(([header, _]) => expectedHeaders.includes(header))
    );

    return {
        authHeaderName: authRequired ? securityParams.authorizationHeader : null,
        apiKeys
    };
}
