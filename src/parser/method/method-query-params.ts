import * as schemaParser from '../schema';
import { capitalize } from "../../utils";
import { parseRequestParams } from "./method-request-params";
import { ParsedInterface } from '../types';
import { Method } from '../../openapi-document';
import { log, LogLevel } from '../../global-logger';

interface ParseQueryResult {
    interfaceName: string | null;
    interface: ParsedInterface | null;
};

export function parseQueryParams(method: Method): ParseQueryResult {
    if (!method.parameters) {
        return {
            interfaceName: null,
            interface: null
        };
    }

    const queryParams = method.parameters.filter((param) => param.in === 'query');
    if (!queryParams.length) {
        return {
            interfaceName: null,
            interface: null
        };
    }

    const schema = parseRequestParams(queryParams);

    Object.values(schema.properties!).forEach(({ schema }) => {
        if (schema.customType || schema.inlineType === 'object' || schema.inlineType === 'file') {
            log(`Error: query param cannot be file or object`, LogLevel.Error);
            process.exit(1);
        }
    });

    const interfaceName = capitalize(method.operationId!) + 'QueryParams';

    return {
        interfaceName,
        interface: {
            name: interfaceName,
            schema
        }
    };
}
