import { Method } from '../../openapi-document';
import { AppError } from '../../core';
import { parseBodyParamsFromParameters } from './method-body-params-from-parameters';
import { ParseMethodBodyErrorEnum, ParseBodyResult } from './method-body-params.types';
import { parseBodyParamsFromRequestBody } from './method-body-params-from-request-body';
import { ParsedInterface } from '../types';

export function parseBodyParams(method: Method, interfaces: ParsedInterface[]): ParseBodyResult | null {
    const requestBodyPreset = !!method.requestBody;
    const parametersPreset = method.parameters &&
        method.parameters.filter((param) => param.in === 'body' || param.in === 'formData').length !== 0

    if (requestBodyPreset && parametersPreset) {
        throw new AppError(ParseMethodBodyErrorEnum.MethodCantContainBothRequestParamsAndBodyParameters);
    } else if (requestBodyPreset) {
        return parseBodyParamsFromRequestBody(method, interfaces);
    } else if (parametersPreset) {
        return parseBodyParamsFromParameters(method, interfaces);
    } else {
        return null;
    }
}
