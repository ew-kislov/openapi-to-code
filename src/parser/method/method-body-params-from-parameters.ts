import { capitalize } from "../../utils";
import { Method, MethodParameter } from '../../openapi-document';
import { ParsedInterface, RequestBodyType } from '../types';
import { AppError } from '../../core';
import { parseRequestParams, isRequestParamSchema, isRequestParamRef } from "./method-request-params";
import { ParseMethodBodyErrorEnum, ParseBodyResult } from './method-body-params.types';
import { parseReference, parseSchema } from "../schema";

/**
 * 1) If "parameters" are in-body: there should be exactly 1 parameter with "schema" property
 * 2) If "parameters" are in-formData: there can be multiple paramters without "schema" property,
 *    with "type" property containing only string, number, boolean, integer, array, file (only object type prohibited)
 */
export function parseBodyParamsFromParameters(method: Method, interfaces: ParsedInterface[]): ParseBodyResult | null {
  if (!method.parameters) {
    return null;
  }

  const { params, bodyType } = getBodyParams(method);

  if (bodyType === 'json') {
    return parseJsonBody(params, method.operationId, interfaces);
  } else if (bodyType === 'formData') {
    return parseFormDataBody(params, method.operationId);
  } else {
    return null;
  }
}

function getBodyParams(method: Method): { params: MethodParameter[], bodyType: RequestBodyType | null } {
  const formDataParams = method.parameters!.filter((param) => param.in === 'formData');
  const bodyParams = method.parameters!.filter((param) => param.in === 'body');

  if (formDataParams.length !== 0 && bodyParams.length !== 0) {
    throw new AppError(ParseMethodBodyErrorEnum.MethodCantContainBothFormDataAndBodyParameters);
  }

  if (formDataParams.length !== 0) {
    return { bodyType: 'formData', params: formDataParams };
  } else if (bodyParams.length !== 0) {
    return { bodyType: 'json', params: bodyParams };
  } else {
    return { bodyType: null, params: [] };
  }
}

function parseJsonBody(params: MethodParameter[], operation: string, interfaces: ParsedInterface[]): ParseBodyResult {
  if ((params.length !== 1 || !params[0].schema)) {
    throw new AppError(ParseMethodBodyErrorEnum.InBodyParamMustBeExactlyOneWithSchema);
  }

  const required = params[0].required ?? false;

  // TODO: check that ref/object doesn't contain file props

  if (isRequestParamRef(params[0])) {
    const referenceSchema = parseReference(params[0].schema);

    return {
      interfaceName: referenceSchema.customType!,
      schema: null,
      bodyType: 'json',
      required
    };
  } else if (isRequestParamSchema(params[0])) {
    return {
      interfaceName: capitalize(operation) + 'BodyParams',
      schema: parseSchema(params[0].schema!),
      bodyType: 'json',
      required
    };
  } else {
    throw new AppError(ParseMethodBodyErrorEnum.InBodyParamMustBeExactlyOneWithSchema);
  }
}

function parseFormDataBody(params: MethodParameter[], operation: string): ParseBodyResult {
  const allowedFormDataTypes = ['string', 'number', 'boolean', 'integer', 'array', 'file'];
  params.forEach((param) => {
    if (param.type && !allowedFormDataTypes.includes(param.type)) {
      throw new AppError(ParseMethodBodyErrorEnum.FormDataParametersMustHavePrimitiveType);
    }
  });

  return {
    interfaceName: capitalize(operation) + 'BodyParams',
    schema: parseRequestParams(params),
    bodyType: 'formData',
    required: true
  };
}
