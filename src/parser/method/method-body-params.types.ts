import { ParsedSchema } from "../types";

export interface ParseBodyResult {
    interfaceName: string;
    required: boolean;
    schema: ParsedSchema | null;
    bodyType: RequestBodyType;
};

export type RequestBodyType = 'formData' | 'json';

export enum ParseMethodBodyErrorEnum {
    RequestBodyMustHaveContentProp = '"requestBody" must contain "content" property',
    RequestBodyMustHaveSchemaProp = '"requestBody" must contain "schema" property',
    MethodCantContainBothRequestParamsAndBodyParameters = 'Method can\'t contain both "requestBody" and body "parameters"',
    MethodCantContainBothFormDataAndBodyParameters = 'Method can\'t contain both in-formdata and in-body "parameters"',
    ObjectItemsAreAllowedOnlyInJsonRequestBody = '"requestBody" items with object type are allowed in "application/json" media type only',
    FileParametersAllowedOnlyInFormDataParameters = 'Items with file type are allowed only in in-formData "parameters"',
    RequestBodyWrongMediaType = 'requestBody must contain exactly one mediaType("multipart/form-data", "application/x-www-form-urlencoded" "application/json")',
    InBodyParamMustBeExactlyOneWithSchema = 'In-body "parameter" must be exactly 1 and contain "schema" property with either "$ref"',
    FormDataParametersMustHavePrimitiveType = 'In-formData "parameters" must have "type" property, one of: string, number, boolean, integer, array, file',
    RequestBodyMustHaveSchemaWithRefOrObject = '"requestBody" must contain "$ref" or "schema" with object type'
};