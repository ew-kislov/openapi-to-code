import _ from "lodash";
import { Paths, Method, ClientSecurityParams, InterfaceData, MethodData } from "../types";
import { generateMethod } from "./method";
import { generateBodyParams } from "./method-body-params";
import { generatePathParams } from "./method-path-params";
import { generateQueryParams } from "./method-query-params";
import { generateResponse } from "./method-response";
import { generateSecurity } from "./method-security";

export interface GenerateMethodResult {
    method: MethodData;
    extraInterfaces: InterfaceData[];
};

export interface GenerateRequestParamsParams {
    pathParams: string[]; // each string has type 'someParam: somePrimitiveType'
    queryInterface: InterfaceData | null;
    bodyInterface: InterfaceData | null;
    isFormData: boolean;
}

export interface GenerateMethodsResult {
    methods: MethodData[];
    interfaces: InterfaceData[];
}

const usedOperationIds: string[] = [];

export function generateMethods(paths: Paths, securityParams: ClientSecurityParams): GenerateMethodsResult {
    const methods: MethodData[] = [];
    let interfaces: InterfaceData[] = [];

    Object.entries(paths).forEach(([path, methodsByPath]) => {
        Object.entries(methodsByPath).forEach(([methodType, methodDefinition]) => {
            preprocessMethodParams(methodDefinition);

            const { method, extraInterfaces } = orchestrateMethodGeneration(path, methodType, methodDefinition, securityParams);

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

export function orchestrateMethodGeneration(
    methodPath: string,
    methodType: string,
    methodDefinition: Method,
    securityParams: ClientSecurityParams
): GenerateMethodResult {
    if (!methodDefinition.operationId) {
        throw Error(`Method ${methodType.toUpperCase()} ${methodPath} doesn't contain operationId property.`);
    }
    if (usedOperationIds.includes(methodDefinition.operationId)) {
        throw Error(`Duplicate operationId '${methodDefinition.operationId}'. All methods must have unique operationId.`);
    }

    usedOperationIds.push(methodDefinition.operationId);

    const pathParams = generatePathParams(methodDefinition);
    const query = generateQueryParams(methodDefinition);
    const bodyGenerationResult = generateBodyParams(methodDefinition);
    const response = generateResponse(methodDefinition);
    const { authHeaderName, apiKeys } = generateSecurity(methodDefinition, securityParams);

    const methodCode = generateMethod({
        methodName: methodDefinition.operationId,
        methodPath,
        methodType,
        pathParams,
        query,
        body: bodyGenerationResult?.interfaceData,
        response,
        authHeaderName,
        apiKeys,
        bodyType: bodyGenerationResult?.bodyType
    });

    return {
        method: {
            code: methodCode,
            path: methodPath,
            functionName: methodDefinition.operationId,
            queryTypename: query?.typename,
            bodyTypename: bodyGenerationResult?.interfaceData?.typename,
            responseTypename: response?.typename
        },
        extraInterfaces: _.compact([
            query,
            bodyGenerationResult?.interfaceData?.code ? bodyGenerationResult.interfaceData: null,
            response?.code ? response : null
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
