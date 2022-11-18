import { Method } from '../../openapi-document';
import { ParsedMethodPathParams, ParsedMethodPathParamType } from '../types';
import * as schemaParser from '../schema';

export function parsePathParams(method: Method): ParsedMethodPathParams[] {
    if (!method.parameters) {
        return [];
    }

    return method.parameters
        .filter((param) => param.in === 'path')
        .map((param) => {
            const schema = schemaParser.parseSchema(param.schema);

            if (!schema.inlineType || !['string', 'number', 'integer', 'enum'].includes(schema.inlineType)) {
                throw Error(`Error: path parameter must primitive type or enum.`);
            }

            return {
                name: param.name,
                type: schema.inlineType as ParsedMethodPathParamType
            };
        });
}
