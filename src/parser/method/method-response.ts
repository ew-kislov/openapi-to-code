import { capitalize } from "../../utils";
import { Method, MethodResponse, Schema } from '../../openapi-document';
import { ParsedInterface } from '../types';
import * as schemaParser from '../schema';
import { log, LogLevel } from "../../global-logger";

interface ParseResponseResult {
    interfaceName: string | null;
    interface: ParsedInterface | null;
};

export function parseResponse(method: Method): ParseResponseResult {
    const successCodes = Object.keys(method.responses).filter((code) => code[0] === '2');
    if (successCodes.length !== 1) {
        log('Response must contain exactly 1 successfull(2**) code.', LogLevel.Error);
        process.exit(1);
    }

    const successCode = successCodes[0];
    const response = method.responses[successCode];

    const schema = getSchemaFromResponse(response);
    if (!schema) {
        return {
            interfaceName: null,
            interface: null
        };
    }

    const parsedSchema = schemaParser.parseSchema(schema);

    if (parsedSchema.customType) {
        return {
            interfaceName: parsedSchema.customType,
            interface: null
        };
    } else {
        const interfaceName = capitalize(method.operationId!) + 'Response';
        return {
            interfaceName: interfaceName,
            interface: { name: interfaceName, schema: parsedSchema }
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
    if (responseMediaTypes.length !== 1 || responseMediaTypes[0] !== 'application/json') {
        log('Response must have only application/json media type.', LogLevel.Error);
        process.exit(1);
    }

    return response.content['application/json'].schema;
}
