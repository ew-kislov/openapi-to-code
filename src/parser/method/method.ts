import _ from "lodash";
import { AppError } from "../../core";
import { setGlobalContext } from "../../global-logger";

import { Paths, Method } from "../../openapi-document";
import { ClientSecurityParams } from "../../types";
import { ParsedInterface, ParsedMethod, MethodType } from "../types";
import { parseBodyParams } from "./method-body-params";
import { parsePathParams } from "./method-path-params";
import { parseQueryParams } from "./method-query-params";
import { parseResponse } from "./method-response";
import { parseSecurity } from "./method-security";

export interface ParseMethodParams {
    methodPath: string;
    methodType: MethodType;
    methodDefinition: Method;
    securityParams: ClientSecurityParams | null;
    documentInterfaces: ParsedInterface[];
};

export interface ParseMethodResult {
    method: ParsedMethod;
    extraInterfaces: ParsedInterface[];
};

export interface ParseRequestParamsParams {
    pathParams: string[]; // each string has type 'someParam: somePrimitiveType'
    queryInterface: ParsedInterface | null;
    bodyInterface: ParsedInterface | null;
    isFormData: boolean;
};

export interface ParseMethodsResult {
    methods: ParsedMethod[];
    interfaces: ParsedInterface[];
};

export enum ParseMethodErrorEnum {
    MethodMustContainOperationId = 'Method must contain operationId property',
    MethodOperationIdMustBeUnique = 'Method must contain unique "operationId" property'
};

export function parseMethods(paths: Paths, securityParams: ClientSecurityParams | null, documentInterfaces: ParsedInterface[]): ParseMethodsResult {
    const methods: ParsedMethod[] = [];
    let interfaces: ParsedInterface[] = [];

    Object.entries(paths).forEach(([methodPath, methodsByPath]) => {
        Object.entries(methodsByPath).forEach(([methodType, methodDefinition]) => {
            const usedOperationIds: string[] = [];

            const operationId = methodDefinition.operationId;

            if (!operationId) {
                throw new AppError(ParseMethodErrorEnum.MethodMustContainOperationId);
            }
            if (usedOperationIds.includes(operationId)) {
                throw new AppError(ParseMethodErrorEnum.MethodOperationIdMustBeUnique);
            }

            usedOperationIds.push(operationId);

            const { method, extraInterfaces } = parseMethod({
                methodPath,
                methodType: methodType as MethodType,
                methodDefinition,
                securityParams,
                documentInterfaces
            });

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

export function parseMethod(params: ParseMethodParams): ParseMethodResult {
    const { methodPath, methodType, methodDefinition, securityParams, documentInterfaces } = params;

    setGlobalContext({});

    const operationId = methodDefinition.operationId;

    setGlobalContext({ operationId, in: 'path' });
    const pathParams = parsePathParams(methodDefinition);

    setGlobalContext({ operationId, in: 'query' });
    const queryParams = parseQueryParams(methodDefinition, documentInterfaces);

    setGlobalContext({ operationId, in: 'body' });
    const body = parseBodyParams(methodDefinition, documentInterfaces);

    setGlobalContext({ operationId, in: 'response' });
    const response = parseResponse(methodDefinition);

    setGlobalContext({ operationId, in: 'security' });
    const security = parseSecurity(methodDefinition, securityParams);

    const method: ParsedMethod = {
        methodName: operationId,
        methodPath,
        methodType: methodType as MethodType,
        pathParams,
        queryParams: queryParams ? queryParams.interfaceName : null,
        body: body ? { interface: body.interfaceName, type: body.bodyType } : null,
        response: response?.interfaceName ?? null,
        security
    };

    return {
        method,
        extraInterfaces: _.compact([
            queryParams?.schema ? { name: queryParams.interfaceName, schema: queryParams.schema } : undefined,
            body?.schema ? { name: body.interfaceName, schema: body.schema } : undefined,
            response?.schema ? { name: response.interfaceName, schema: response.schema } : undefined
        ])
    };
}
