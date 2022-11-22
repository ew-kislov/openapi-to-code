import { Method } from '../../openapi-document';
import { ParsedMethodPathParams, ParsedMethodPathParamType } from '../types';
import * as schemaParser from '../schema';
import { log, LogLevel } from '../../global-logger';

export function parsePathParams(method: Method): ParsedMethodPathParams[] {
    if (!method.parameters) {
        return [];
    }

    return method.parameters
        .filter((param) => param.in === 'path')
        .map((param) => {
            const schema = schemaParser.parseSchema(param.schema);

            if (!schema.inlineType || !['string', 'number', 'integer', 'enum'].includes(schema.inlineType)) {
                log(`Error: path parameter must primitive type or enum.`, LogLevel.Error);
                process.exit(1);
            }

            return {
                name: param.name,
                type: schema.inlineType as ParsedMethodPathParamType
            };
        });
}
