import { AppError } from "../../core";
import { Method } from "../../openapi-document";
import { ClientSecurityParams } from "../../types";
import { ParsedMethodSecurity } from "../types";

export enum ParseMethodSecurityErrorEnum {
    UnknownSecurityHeader = 'Unknown security header, not found in generator parameters'
}

export function parseSecurity(method: Method, securityParams: ClientSecurityParams | null): ParsedMethodSecurity {
    // if (!securityParams?.apiKeysMapping && !securityParams?.authorizationHeader) {
    //     return {
    //         authRequired: false,
    //         apiKeys: {}
    //     };
    // }

    if (!method.security || method.security.length === 0) {
        return {
            authRequired: false,
            apiKeys: {}
        };
    }

    const expectedHeaders = securityParams?.apiKeysMapping ? Object.keys(securityParams.apiKeysMapping) : [];
    const securityHeaders = method.security.flatMap((headerRaw) => Object.keys(headerRaw));

    securityHeaders.forEach((header) => {
        if (header !== securityParams?.authorizationHeader && !expectedHeaders.includes(header)) {
            throw new AppError(ParseMethodSecurityErrorEnum.UnknownSecurityHeader);
        }
    });

    const authRequired = !!securityHeaders.find((header) => header === securityParams?.authorizationHeader);
    const apiKeys = Object.fromEntries(
        Object.entries(securityParams?.apiKeysMapping ?? {}).filter(([header, _]) => securityHeaders.includes(header))
    );

    return {
        authRequired,
        apiKeys
    };
}
