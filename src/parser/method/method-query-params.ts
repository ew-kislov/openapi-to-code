import { capitalize } from "../../utils";
import { isRequestParamObject, isRequestParamRef, parseRequestParams } from "./method-request-params";
import { ParsedInterface, ParsedSchema } from '../types';
import { Method, MethodParameter } from '../../openapi-document';
import { parseSchema } from "../schema";
import { AppError } from "../../core";

export interface ParseQueryResult {
    interfaceName: string;
    schema: ParsedSchema | null;
};

export enum ParseMethodQueryParamsErrorEnum {
    SchemaNotFoundInDefinitions = 'Schema not found in document definitions',
    SchemaCantContainObjectsOrFiles = 'Schema can\'t contain nested objects or files',
    QueryParamsCantContainOtherParamsIfHasObjectParam = 'Method can\'t have other query parameters if it has object/$ref query parameter'
};

const nowAllowedQueryParamTypes = ['file', 'object']
const nowAllowedQueryParamTypesInArray = ['file', 'object', 'array']

/**
 * OAS2:
 * Query parameter can contain only "type" property
 * 
 * OAS3:
 * Query parameter has 2 options:
 * 1) Contain "schema" propert inside each parameter(schema can be an object, can have $ref, etc.).
 *    For simplicity(and because of non popularity of other cases) only 2 cases will be parsed:
 *      a) parameters items contain all types except: object, $ref, file
 *      b) parameters contains 1 item with object or $ref
 * 2) Contain "content" which contains media-type and schema inside.
 *    For simplicity(and because of non popularity of other cases) this case won't be parsed
 */
export function parseQueryParams(method: Method, interfaces: ParsedInterface[]): ParseQueryResult | null {
    if (!method.parameters) {
        return null;
    }

    const queryParams = method.parameters.filter((param) => param.in === 'query');

    if (!queryParams.length) {
        return null;
    }

    if (queryParams.length === 1 && (isRequestParamRef(queryParams[0]) || isRequestParamObject(queryParams[0]))) {
        return parseQuerySchemaParam(queryParams[0], method.operationId!, interfaces);
    } else {
        return parseQueryPrimitiveParams(queryParams, method.operationId!);
    }
}

function parseQuerySchemaParam(param: MethodParameter, operation: string, interfaces: ParsedInterface[]): ParseQueryResult {
    const schema = parseSchema(param.schema!);

    if (schema.customType) {
        const foundInterface = interfaces.find((item) => item.name === schema.customType);
        if (!foundInterface) {
            throw new AppError(ParseMethodQueryParamsErrorEnum.SchemaNotFoundInDefinitions);
        }

        validateQuerySchemaParam(foundInterface.schema);

        return {
            interfaceName: schema.customType,
            schema: null
        }
    } else {
        validateQuerySchemaParam(schema);

        return {
            interfaceName: capitalize(operation) + 'QueryParams',
            schema
        };
    }
}

function parseQueryPrimitiveParams(params: MethodParameter[], operation: string): ParseQueryResult {
    params.forEach((param) => {
        if (isRequestParamRef(param) || isRequestParamObject(param)) {
            throw new AppError(ParseMethodQueryParamsErrorEnum.QueryParamsCantContainOtherParamsIfHasObjectParam);
        }
    });

    const schema = parseRequestParams(params);

    validateQuerySchemaParam(schema);

    return {
        interfaceName: capitalize(operation) + 'QueryParams',
        schema
    };
}

function validateQuerySchemaParam(schema: ParsedSchema) {
    Object.values(schema.properties!).forEach((property) => {
        if (property.schema.customType) {
            throw new AppError(ParseMethodQueryParamsErrorEnum.SchemaCantContainObjectsOrFiles);
        }
        if (nowAllowedQueryParamTypes.includes(property.schema.inlineType!)) {
            throw new AppError(ParseMethodQueryParamsErrorEnum.SchemaCantContainObjectsOrFiles);
        }
        if (
            property.schema.inlineType === 'array' &&
            (property.schema.itemsSchema?.customType || nowAllowedQueryParamTypesInArray.includes(property.schema.itemsSchema?.inlineType!))
        ) {
            throw new AppError(ParseMethodQueryParamsErrorEnum.SchemaCantContainObjectsOrFiles);
        }
    });
}