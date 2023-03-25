import { capitalize } from "../../utils";
import { Method, MethodResponse, Schema } from '../../openapi-document';
import { ParsedSchema } from '../types';
import * as schemaParser from '../schema';
import { AppError } from "../../core";

export interface ParseBodyResult {
    interfaceName: string;
    schema: ParsedSchema | null;
};

export enum ParseMethodResponseErrorEnum {
    ResponseMustContainExactlyOneSuccessfulResponseCode = 'Response must contain exactly 1 successfull(2**) code',
    ResponseCanHaveOnlyJsonContentType = 'Response must have only application/json media type'
};

export function parseResponse(method: Method): ParseBodyResult | null {
    if (!method.responses) {
        return null;
    }

    const successCodes = Object.keys(method.responses).filter((code) => code[0] === '2' || code === 'default');

    if (successCodes.length === 0) {
        return null;
    }
    if (successCodes.length !== 1) {
        throw new AppError(ParseMethodResponseErrorEnum.ResponseMustContainExactlyOneSuccessfulResponseCode);
    }

    const successCode = successCodes[0];
    const response = method.responses[successCode];

    const schema = getSchemaFromResponse(response);
    if (!schema) {
        return null;
    }

    const parsedSchema = schemaParser.parseSchema(schema);

    if (parsedSchema.customType) {
        return {
            interfaceName: parsedSchema.customType,
            schema: null
        };
    } else {
        return {
            interfaceName: capitalize(method.operationId!) + 'Response',
            schema: parsedSchema
        };
    }
}

export function getSchemaFromResponse(response: MethodResponse): Schema | null {
    if (response.schema) {
        return response.schema;
    }

    if (!response.content) {
        return null;
    }

    const responseMediaTypes = Object.keys(response.content);

    if (responseMediaTypes.length === 0) {
        return null;
    }

    if (responseMediaTypes.length !== 1 || (responseMediaTypes[0] !== 'application/json' && responseMediaTypes[0] !== '*/*')) {
        throw new AppError(ParseMethodResponseErrorEnum.ResponseCanHaveOnlyJsonContentType);
    }

    const schema = response.content['application/json']?.schema ?? response.content['*/*']?.schema ?? null;

    return schema;
}
