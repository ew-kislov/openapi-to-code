import { Method, MethodResponse, Schema } from "../types";
import * as schemaParser from '../schema';
import { capitalize } from "../utils";

export interface GenerateResponseResult {
    responseInterfaceCode: string | null;
    responseTypename: string | null;
}

export function generateResponse(method: Method): GenerateResponseResult {
    const successCodes = Object.keys(method.responses).filter((code) => code[0] === '2');
    if (successCodes.length !== 1) {
        throw Error('Response must contain exactly 1 successfull(2**) code.');
    }

    const successCode = successCodes[0];
    const response = method.responses[successCode];

    const schema = getSchemaFromResponse(response);
    if (!schema) {
        return { responseInterfaceCode: null, responseTypename: null };
    }

    if (schemaParser.isRef(schema)) {
        return {
            responseInterfaceCode: null,
            responseTypename: schemaParser.generateSchema(schema)
        };
    } else {
        const interfaceBodyCode = schemaParser.generateSchema(schema)
        const interfaceName = capitalize(method.operationId!) + 'Response';

        const interfaceCode = `export interface ${interfaceName} ${interfaceBodyCode}`;

        return {
            responseInterfaceCode: interfaceCode,
            responseTypename: interfaceName
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
        throw Error('Response must have only application/json media type.');
    }

    return response.content['application/json'].schema;
}
