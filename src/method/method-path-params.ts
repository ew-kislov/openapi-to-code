import { Method } from "../types";
import * as schemaParser from '../schema';

export interface GenerateRequestPathParamsParams {
    pathParams: string[]; // each string has type 'someParam: somePrimitiveType'
}

export function generatePathParams(method: Method): GenerateRequestPathParamsParams {
    if (!method.parameters) {
        return { pathParams: [] };
    }

    const pathParams = method.parameters
        .filter((param) => param.in === 'path')
        .map((param) => {
            if (!schemaParser.isEnum(param.schema) && !schemaParser.isPrimitive(param.schema)) {
                throw Error(`Error: path parameter must primitive type or enum.`);
            }
            const type = schemaParser.generateSchema(param.schema);

            return `${param.name}: ${type}`;
        });

    return { pathParams };
}
