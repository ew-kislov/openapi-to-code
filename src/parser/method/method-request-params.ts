import { AppError } from '../../core';
import { MethodParameter } from '../../openapi-document';
import * as schemaParser from '../schema';
import { ParsedSchema } from '../types';

export enum ParseMethodRequestParamsErrorEnum {
    ParameterMustHaveName = '"parameters" item must have "name"',
    ParameterCantHaveBothTypeAndSchema = '"parameters" item can\'t have both "type" and "schema"',
    ArrayCanContainOnlyPrimitives = 'Array parameter can contain only primitive types(string, number, integer, boolean)',
    UnsupportedTypeInParameter = 'Parameter "type" can contain only on of the following types: string, number, integer, boolean, file, array'
};

export function isRequestParamSchema(params: MethodParameter): boolean {
    return !!params.schema;
}

export function isRequestParamRef(params: MethodParameter): boolean {
    return !!params.schema?.$ref;
}

export function isRequestParamObject(params: MethodParameter): boolean {
    return params.schema?.type === 'object';
}

/**
 * NOTE: this function will parse any parameter independently and will not check if
 * if there are multiple objects or reference types among params.
 * It is responsibility of path/query/body params parsers to check for parsed request "parameters"
 */
export function parseRequestParams(params: MethodParameter[]): ParsedSchema {
    const propertiesAsEntries = params.map((param) => {
        if (!param.name) {
            throw new AppError(ParseMethodRequestParamsErrorEnum.ParameterMustHaveName);
        }

        const name = param.name;
        const required = param.required === true;
        const schema = parseRequestParam(param);

        return [name, { schema, required }];
    });

    return {
        inlineType: 'object',
        properties: Object.fromEntries(propertiesAsEntries)
    };
}

export function parseRequestParam(param: MethodParameter): ParsedSchema {
    if (param.type && param.schema) {
        throw new AppError(ParseMethodRequestParamsErrorEnum.ParameterCantHaveBothTypeAndSchema);
    }

    if (param.type) { // path, query, formData(OS2) syntax
        return parseParameterWithType(param);
    } else if (param.schema) { // body(OS2) syntax
        return parseParameterWithSchema(param);
    } else {
        return { inlineType: 'unknown' };
    }
}

export function parseParameterWithType(param: MethodParameter): ParsedSchema {
    if (isEnum(param)) {
        return parseEnum(param);
    } else if (isPrimitive(param)) {
        return parsePrimitive(param);
    } else if (isFile(param)) {
        return parseFile(param);
    } else if (isArray(param)) {
        return parseArray(param);
    } else {
        throw new AppError(ParseMethodRequestParamsErrorEnum.UnsupportedTypeInParameter);
    }
}

function isEnum(param: MethodParameter): boolean {
    return !!param.enum;
}

function parseEnum(param: MethodParameter): ParsedSchema {
    return { inlineType: 'enum', enum: param.enum };
}

function isPrimitive(param: MethodParameter): boolean {
    return ['string', 'number', 'integer', 'boolean'].includes(param.type!);
}

function parsePrimitive(param: MethodParameter): ParsedSchema {
    return { inlineType: param.type };
}

function isFile(param: MethodParameter): boolean {
    return param.type === 'file';
}

function parseFile(param: MethodParameter): ParsedSchema {
    return { inlineType: 'file' };
}

function isArray(param: MethodParameter): boolean {
    return param.type === 'array';
}

function parseArray(param: MethodParameter): ParsedSchema {
    if (param.items?.enum) {
        return { inlineType: 'array', itemsSchema: { inlineType: 'enum', enum: param.items?.enum } };
    } else if (param.items?.type && ['string', 'number', 'integer', 'boolean'].includes(param.items.type)) {
        return { inlineType: 'array', itemsSchema: { inlineType: param.items.type } };
    } else if (!param.items?.type) {
        return { inlineType: 'array', itemsSchema: { inlineType: 'unknown' } };
    } else {
        throw new AppError(ParseMethodRequestParamsErrorEnum.ArrayCanContainOnlyPrimitives);
    }
}

function parseParameterWithSchema(param: MethodParameter): ParsedSchema {
    return schemaParser.parseSchema(param.schema!);
}