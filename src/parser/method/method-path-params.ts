import { Method } from '../../openapi-document';
import { ParsedMethodPathParams, ParsedMethodPathParamType } from '../types';
import { parseRequestParams } from './method-request-params';
import { AppError } from '../../core';

export enum ParseMethodPathParamsErrorEnum {
    RequestPathParamMustHavePrimitiveType = 'Path param must be primitive type: string, number, integer',
};

const allowedPathTypes: ParsedMethodPathParamType[] = ['string', 'number', 'integer'];

export function parsePathParams(method: Method): ParsedMethodPathParams[] {
    if (!method.parameters) {
        return [];
    }

    const pathParams = method.parameters.filter((param) => param.in === 'path');

    if (pathParams.length === 0) {
        return [];
    }

    const schema = parseRequestParams(pathParams);

    const parsedParams: ParsedMethodPathParams[] = [];

    Object.entries(schema.properties!).forEach(([name, item]) => {
        if (item.schema.inlineType && allowedPathTypes.includes(item.schema.inlineType as ParsedMethodPathParamType)) {
            parsedParams.push({ name, type: item.schema.inlineType as ParsedMethodPathParamType });
        } else {
            throw new AppError(ParseMethodPathParamsErrorEnum.RequestPathParamMustHavePrimitiveType);
        }
    });

    return parsedParams;
}
