import _ from "lodash";
import { Paths, Method, ClientSecurityParams } from "../types";
import { generateMethod } from "./method";
import { generateBodyParams } from "./method-body-params";
import { generatePathParams } from "./method-path-params";
import { generateQueryParams } from "./method-query-params";
import { generateResponse } from "./method-response";
import { generateSecurity } from "./method-security";

export interface GenerateMethodsResult {
    methodsAsCode: string[];
    interfacesAsCode: string[];
}

export interface GenerateMethodResult {
    methodCode: string;
    extraInterfacesCode: string[];
};

export interface GenerateRequestParamsParams {
    pathParams: string[]; // each string has type 'someParam: somePrimitiveType'
    queryInterfaceCode: string | null;
    bodyInterfaceCode: string | null;
    queryTypename: string | null;
    bodyTypename: string | null;
    isFormData: boolean;
}

export interface GenerateMethodsResult {
    methodsAsCode: string[];
    interfacesAsCode: string[];
}

const usedOperationIds: string[] = [];

export function generateMethods(paths: Paths, securityParams: ClientSecurityParams): GenerateMethodsResult {
    const methodsAsCode: string[] = [];
    let interfacesAsCode: string[] = [];

    Object.entries(paths).forEach(([path, methodsByPath]) => {
        Object.entries(methodsByPath).forEach(([methodType, method]) => {
            preprocessMethodParams(method);

            const { methodCode, extraInterfacesCode } = orchestrateMethodGeneration(path, methodType, method, securityParams);

            methodsAsCode.push(methodCode);
            if (extraInterfacesCode.length !== 0) {
                interfacesAsCode = interfacesAsCode.concat(extraInterfacesCode);
            }
        });
    });

    return {
        methodsAsCode,
        interfacesAsCode
    };
}

export function orchestrateMethodGeneration(
    methodPath: string,
    methodType: string,
    method: Method,
    securityParams: ClientSecurityParams
): GenerateMethodResult {
    if (!method.operationId) {
        throw Error(`Method ${methodType.toUpperCase()} ${methodPath} doesn't contain operationId property.`);
    }
    if (usedOperationIds.includes(method.operationId)) {
        throw Error(`Duplicate operationId '${method.operationId}'. All methods must have unique operationId.`);
    }

    usedOperationIds.push(method.operationId);

    const { pathParams } = generatePathParams(method);
    const { queryInterfaceCode, queryTypename } = generateQueryParams(method);
    const { bodyInterfaceCode, bodyTypename, bodyType } = generateBodyParams(method);

    const { responseInterfaceCode, responseTypename } = generateResponse(method);
    const { authHeaderName, apiKeys } = generateSecurity(method, securityParams);

    const methodCode = generateMethod({
        methodName: method.operationId,
        methodPath,
        methodType,
        pathParams,
        queryTypename,
        bodyTypename,
        responseTypename,
        authHeaderName,
        apiKeys,
        bodyType
    });

    return {
        methodCode,
        extraInterfacesCode: _.compact([queryInterfaceCode, bodyInterfaceCode, responseInterfaceCode])
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
