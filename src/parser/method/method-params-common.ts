import { MethodParameter } from "../types";
import * as schemaParser from '../schema';

export function generateParamsIntoInterface(params: MethodParameter[]): string {
    const propCodes = params.map((param) => {
        const name = param.name;
        const type = schemaParser.generateSchema(param.schema);
        const required = param.required === true;

        return `${name}${required ? '' : '?'}:${type}`;
    });

    return '{' + propCodes.join(';') + '}';
}
