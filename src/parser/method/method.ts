import _ from "lodash";
import { log, LogLevel, setGlobalContext } from "../../global-logger";

import { Paths, Method } from "../../openapi-document";
import { ClientSecurityParams } from "../../types";
import { ParsedInterface, ParsedMethod, MethodType } from "../types";
import { parseBodyParams } from "./method-body-params";
import { parsePathParams } from "./method-path-params";
import { parseQueryParams } from "./method-query-params";
import { parseResponse } from "./method-response";
import { parseSecurity } from "./method-security";

export interface ParseMethodResult {
    method: ParsedMethod;
    extraInterfaces: ParsedInterface[];
};

export interface ParseRequestParamsParams {
    pathParams: string[]; // each string has type 'someParam: somePrimitiveType'
    queryInterface: ParsedInterface | null;
    bodyInterface: ParsedInterface | null;
    isFormData: boolean;
}

export interface ParseMethodsResult {
    methods: ParsedMethod[];
    interfaces: ParsedInterface[];
}

const usedOperationIds: string[] = [];

export function parseMethods(paths: Paths, securityParams: ClientSecurityParams): ParseMethodsResult {
    const methods: ParsedMethod[] = [];
    let interfaces: ParsedInterface[] = [];

    Object.entries(paths).forEach(([path, methodsByPath]) => {
        Object.entries(methodsByPath).forEach(([methodType, methodDefinition]) => {
            const { method, extraInterfaces } = parseMethod(path, methodType, methodDefinition, securityParams);

            methods.push(method);
            if (extraInterfaces.length !== 0) {
                interfaces = interfaces.concat(extraInterfaces);
            }
        });
    });

    return {
        methods,
        interfaces
    };
}

export function parseMethod(
    methodPath: string,
    methodType: string,
    methodDefinition: Method,
    securityParams: ClientSecurityParams
): ParseMethodResult {
    setGlobalContext({});

    const { operationId } = methodDefinition;

    if (!operationId) {
        log(`Method ${methodType.toUpperCase()} ${methodPath} doesn't contain operationId property.`, LogLevel.Error);
        process.exit(1);
    }
    if (usedOperationIds.includes(operationId)) {
        log(`Duplicate operationId '${operationId}'. All methods must have unique operationId.`, LogLevel.Error);
        process.exit(1);
    }

    usedOperationIds.push(operationId);

    preprocessMethodParams(methodDefinition);

    setGlobalContext({ operationId, in: 'path' });
    const pathParams = parsePathParams(methodDefinition);

    setGlobalContext({ operationId, in: 'query' });
    const queryParams = parseQueryParams(methodDefinition);

    setGlobalContext({ operationId, in: 'body' });
    const body = parseBodyParams(methodDefinition);

    setGlobalContext({ operationId, in: 'response' });
    const response = parseResponse(methodDefinition);

    setGlobalContext({ operationId, in: 'security' });
    const security = parseSecurity(methodDefinition, securityParams);

    const method: ParsedMethod = {
        methodName: operationId,
        methodPath,
        methodType: methodType as MethodType,
        pathParams,
        queryParams: queryParams.interfaceName,
        body: body.interfaceName && body.bodyType ? { interface: body.interfaceName, type: body.bodyType } : null,
        response: response.interfaceName,
        security
    };

    return {
        method,
        extraInterfaces: _.compact([
            queryParams.interface,
            body.interface,
            response.interface
        ])
    };
}

export function preprocessMethodParams(method: Method) {
    if (!method.parameters) {
        return;
    }

    method.parameters.forEach((param) => {
        if (!param.schema) {
            param.schema = {
                type: param.type
            }
        } else if (param.schema && !param.schema.type) {
            param.schema.type = param.type;
        }
    });
}
