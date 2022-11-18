import _ from "lodash";

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
    if (!methodDefinition.operationId) {
        throw Error(`Method ${methodType.toUpperCase()} ${methodPath} doesn't contain operationId property.`);
    }
    if (usedOperationIds.includes(methodDefinition.operationId)) {
        throw Error(`Duplicate operationId '${methodDefinition.operationId}'. All methods must have unique operationId.`);
    }
    usedOperationIds.push(methodDefinition.operationId);

    preprocessMethodParams(methodDefinition);

    const pathParams = parsePathParams(methodDefinition);
    const queryParams = parseQueryParams(methodDefinition);
    const body = parseBodyParams(methodDefinition);
    const response = parseResponse(methodDefinition);
    const security = parseSecurity(methodDefinition, securityParams);

    const method: ParsedMethod = {
        methodName: methodDefinition.operationId,
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
