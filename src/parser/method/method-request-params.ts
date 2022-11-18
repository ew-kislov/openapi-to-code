import { MethodParameter } from '../../openapi-document';
import * as schemaParser from '../schema';
import { ParsedSchema } from '../types';

export function parseRequestParams(params: MethodParameter[]): ParsedSchema {
    const propertiesAsEntries = params.map((param) => {
        const name = param.name;
        const required = param.required === true;
        const schema = schemaParser.parseSchema(param.schema);

        return [ name, { schema, required } ];
    });

    return {
        inlineType: 'object',
        properties: Object.fromEntries(propertiesAsEntries)
    };
}
