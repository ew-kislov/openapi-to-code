import { Method } from "../types";
import * as schemaParser from '../schema';
import { capitalize } from "../utils";
import { generateParamsIntoInterface } from "./method-params-common";

export interface GenerateRequestQueryParamsParams {
    queryInterfaceCode: string | null;
    queryTypename: string | null;
}

export function generateQueryParams(method: Method): GenerateRequestQueryParamsParams {
    if (!method.parameters) {
        return { queryInterfaceCode: null, queryTypename: null };
    }

    const queryParams = method.parameters.filter((param) => param.in === 'query');
    if (!queryParams.length) {
        return { queryInterfaceCode: null, queryTypename: null };
    }

    queryParams.forEach((param) => {
        if (schemaParser.isFile(param.schema) || schemaParser.isObject(param.schema)) {
            throw Error(`Error: query param cannot be file or object`);
        }
    });

    const interfaceBodyCode = generateParamsIntoInterface(queryParams);
    const interfaceName = capitalize(method.operationId!) + 'QueryParams';

    const interfaceCode = `export interface ${interfaceName} ${interfaceBodyCode}`;

    return {
        queryInterfaceCode: interfaceCode,
        queryTypename: interfaceName
    };
}
