import { log, LogLevel } from "../../global-logger";
import { Method } from "../../openapi-document";
import { ClientSecurityParams } from "../../types";
import { ParsedMethodSecurity } from "../types";

export function parseSecurity(method: Method, securityParams: ClientSecurityParams): ParsedMethodSecurity {
    if (!method.security || method.security.length === 0) {
        return {
            authRequired: false,
            apiKeys: {}
        };
    }

    const expectedHeaders = Object.keys(securityParams.apiKeysMapping);
    const securityHeaders = method.security.flatMap((headerRaw) => Object.keys(headerRaw));

    securityHeaders.forEach((header) => {
        if (header !== securityParams.authorizationHeader && !expectedHeaders.includes(header)) {
            log(`Found security header '${header}' which is not mentioned in generator parameters.`, LogLevel.Error);
            process.exit(1);
        }
    });

    const authRequired = !!securityHeaders.find((header) => header === securityParams.authorizationHeader);
    const apiKeys = Object.fromEntries(
        Object.entries(securityParams.apiKeysMapping).filter(([header, _]) => expectedHeaders.includes(header))
    );

    return {
        authRequired,
        apiKeys
    };
}
