import * as schemaParser from '../schema';
import { parseRequestParams } from "./method-request-params";
import { capitalize } from "../../utils";
import { Method } from '../../openapi-document';
import { ParsedInterface, ParsedSchema } from '../types';

interface ParseResponseResult {
    interfaceName: string | null;
    interface: ParsedInterface | null;
    bodyType: RequestBodyType | null
};

export type RequestBodyType = 'formData' | 'json';

export function parseBodyParams(method: Method): ParseResponseResult {
    const requestBodyPreset = !!method.requestBody;
    const parametersPreset = method.parameters &&
        method.parameters.filter((param) => param.in === 'body' || param.in === 'formData').length !== 0

    if (requestBodyPreset && parametersPreset) {
        throw Error(`Error: body must be defined either in 'requestBody' or in params`);
    }

    if (!requestBodyPreset && !parametersPreset) {
        return {
            interfaceName: null,
            interface: null,
            bodyType: null
        };
    }

    return requestBodyPreset
        ? parseBodyParamsFromRequestBody(method)
        : parseBodyParamsFromParameters(method);
}

export function parseBodyParamsFromRequestBody(method: Method): ParseResponseResult {
    const mediaTypes = Object.keys(method.requestBody!.content);
    if (mediaTypes.length !== 1 || !['multipart/form-data', 'application/json'].includes(mediaTypes[0])) {
        throw Error(`Error: 'requestBody must contain one mediaType, either multipart/form-data or application/json'`);
    }

    const mediaType = Object.keys(method.requestBody!.content)[0];
    const bodyType: RequestBodyType = (mediaType === 'multipart/form-data' ? 'formData' : 'json');

    const schema = schemaParser.parseObject(method.requestBody!.content[mediaType].schema);

    validateBodySchemaProperties(schema, bodyType);

    if (schema.customType) {
        return {
            interfaceName: schema.customType,
            interface: null,
            bodyType
        };
    } else {
        const interfaceName = capitalize(method.operationId!) + 'BodyParams';

        return {
            interfaceName,
            interface: {
                name: interfaceName,
                schema
            },
            bodyType
        };
    }
}

export function parseBodyParamsFromParameters(method: Method): ParseResponseResult {
    const formDataParams = method.parameters!.filter((param) => param.in === 'formData');
    const bodyParams = method.parameters!.filter((param) => param.in === 'body');

    if (formDataParams.length !== 0 && bodyParams.length !== 0) {
        throw Error(`Method cannot contain both in-formdata and in-body parameters.`);
    }

    const bodyType: RequestBodyType = formDataParams.length !== 0 ? 'formData' : 'json';
    const params = bodyType === 'formData' ? formDataParams : bodyParams;

    const schema = parseRequestParams(params);

    validateBodySchemaProperties(schema, bodyType);

    const interfaceName = capitalize(method.operationId!) + 'BodyParams';

    return {
        interfaceName,
        interface: {
            name: interfaceName,
            schema
        },
        bodyType
    };
}

function validateBodySchemaProperties(schema: ParsedSchema, bodyType: RequestBodyType) {
    /**
     * TODO: check referenced schema to have no nested objects
     */

    Object.values(schema.properties!).forEach((prop) => {
        if (bodyType === 'formData' && prop.schema === 'object') {
            throw Error(`FormData parameter can't have nested objects`);
        }
        if (bodyType === 'json' && prop.schema === 'file') {
            throw Error(`File parameters are allowed only in formData parameters`);
        }
    });
}