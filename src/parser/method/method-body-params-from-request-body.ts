import * as schemaParser from '../schema';
import { capitalize } from "../../utils";
import { Method, RequestContentType } from '../../openapi-document';
import { ParsedInterface, ParsedSchema, RequestBodyType } from '../types';
import { AppError } from '../../core';
import { ParseMethodBodyErrorEnum, ParseBodyResult } from './method-body-params.types';

const acceptedMediaTypes = ['application/x-www-form-urlencoded', 'multipart/form-data', 'application/json'];

export function parseBodyParamsFromRequestBody(method: Method, interfaces: ParsedInterface[]): ParseBodyResult | null {
  if (!method.requestBody) {
    return null;
  }
  if (!method.requestBody.content) {
    throw new AppError(ParseMethodBodyErrorEnum.RequestBodyMustHaveContentProp);
  }

  const mediaType = getRequestMediaType(method);
  const bodyType: RequestBodyType = mediaType === 'application/json' ? 'json' : 'formData';

  if (!method.requestBody!.content![mediaType].schema) {
    throw new AppError(ParseMethodBodyErrorEnum.RequestBodyMustHaveSchemaProp);
  }

  const schema = schemaParser.parseSchema(method.requestBody!.content![mediaType].schema);

  if (!schema.customType && schema.inlineType !== 'object') {
    throw new AppError(ParseMethodBodyErrorEnum.RequestBodyMustHaveSchemaWithRefOrObject);
  }

  const required = method.requestBody!.required ?? false;

  if (schema.customType) {
    validateBodyCustomerType(schema.customType, interfaces);
  } else {
    validateBodySchemaProperties(schema, bodyType);
  }

  return {
    interfaceName: schema.customType ?? capitalize(method.operationId!) + 'BodyParams',
    schema: schema.customType ? null : schema,
    bodyType,
    required
  };
}

function getRequestMediaType(method: Method): RequestContentType {
  const mediaTypes = Object.keys(method.requestBody!.content!);

  if (mediaTypes.length !== 1 || !acceptedMediaTypes.includes(mediaTypes[0])) {
    throw new AppError(ParseMethodBodyErrorEnum.RequestBodyWrongMediaType);
  }

  return mediaTypes[0] as RequestContentType;
}

function validateBodyCustomerType(customType: string, interfaces: ParsedInterface[]): void {
  // TODO: check that ref/object doesn't contain file props
}

function validateBodySchemaProperties(schema: ParsedSchema, bodyType: RequestBodyType): void {
  Object.values(schema.properties!).forEach((prop) => {
    if (bodyType === 'formData' && prop.schema.inlineType === 'object') {
      throw new AppError(ParseMethodBodyErrorEnum.ObjectItemsAreAllowedOnlyInJsonRequestBody);
    }
    if (bodyType === 'json' && prop.schema.inlineType === 'file') {
      throw new AppError(ParseMethodBodyErrorEnum.FileParametersAllowedOnlyInFormDataParameters);
    }
  });
}
