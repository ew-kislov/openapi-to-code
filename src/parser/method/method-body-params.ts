import { InterfaceData, Method } from "../types";
import * as schemaParser from '../schema';
import { generateParamsIntoInterface } from "./method-params-common";
import { capitalize } from "../utils";

export interface GenerateRequestBodyParamsParams {
    interfaceData?: InterfaceData
    bodyType: RequestBodyType;
}

export type RequestBodyType = 'formData' | 'json';

export function generateBodyParams(method: Method): GenerateRequestBodyParamsParams | null {
    const requestBodyPreset = !!method.requestBody;
    const parametersPreset = method.parameters &&
        method.parameters.filter((param) => param.in === 'body' || param.in === 'formData').length !== 0

    if (requestBodyPreset && parametersPreset) {
        throw Error(`Error: body must be defined either in 'requestBody' or in params`);
    }

    if (!requestBodyPreset && !parametersPreset) {
        return null;
    }

    return requestBodyPreset
        ? generateBodyParamsFromRequestBody(method)
        : generateBodyParamsFromParameters(method);
}

export function generateBodyParamsFromRequestBody(method: Method): GenerateRequestBodyParamsParams {
    const mediaTypes = Object.keys(method.requestBody!.content);
    if (mediaTypes.length !== 1 || !['multipart/form-data', 'application/json'].includes(mediaTypes[0])) {
        throw Error(`Error: 'requestBody must contain one mediaType, either multipart/form-data or application/json'`);
    }

    const mediaType = Object.keys(method.requestBody!.content)[0];
    const bodyType: RequestBodyType = (mediaType === 'multipart/form-data' ? 'formData' : 'json');
    const schema = method.requestBody!.content[mediaType].schema;

    /**
     * TODO: check referenced schema to have no nested objects
     */
    if (mediaType === 'multipart/form-data' && schema.properties) {
        Object.values(schema.properties).forEach((prop) => {
            if (schemaParser.isObject(prop)) {
                throw Error(`FormData parameter can't have nested objects`);
            }
        });
    }

    if (schemaParser.isRef(schema)) {
        return {
            interfaceData: {
                typename: schemaParser.generateSchema(schema)
            },
            bodyType
        };
    } else {
        const interfaceBodyCode = schemaParser.generateSchema(schema)
        const interfaceName = capitalize(method.operationId!) + 'BodyParams';

        const interfaceCode = `export interface ${interfaceName} ${interfaceBodyCode}`;

        return {
            interfaceData: {
                code: interfaceCode,
                typename: interfaceName
            },
            bodyType
        };
    }
}

export function generateBodyParamsFromParameters(method: Method): GenerateRequestBodyParamsParams {
    const formDataParams = method.parameters!.filter((param) => param.in === 'formData');
    const bodyParams = method.parameters!.filter((param) => param.in === 'body');

    if (formDataParams.length !== 0 && bodyParams.length !== 0) {
        throw Error(`Method cannot contain both in-formdata and in-body parameters.`);
    }

    const bodyType: RequestBodyType = formDataParams.length !== 0 ? 'formData' : 'json';
    const params = bodyType === 'formData' ? formDataParams : bodyParams;

    params.forEach((param) => {
        if (bodyType === 'formData' && param.schema.type === 'object') {
            throw Error(`FormData parameter can't have nested objects`);
        }
        if (bodyType === 'json' && param.schema.type === 'file') {
            throw Error(`File parameters are allowed only in formData parameters`);
        }
    });

    const interfaceBodyCode = generateParamsIntoInterface(params);
    const interfaceName = capitalize(method.operationId!) + 'BodyParams';

    const interfaceCode = `export interface ${interfaceName} ${interfaceBodyCode}`;

    return {
        interfaceData: {
            code: interfaceCode,
            typename: interfaceName
        },
        bodyType
    };
}
