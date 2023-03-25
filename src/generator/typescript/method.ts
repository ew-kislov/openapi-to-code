import _ from "lodash";

import { ParsedMethod, ParsedMethodPathParams } from "../../parser";
import { GenerateClientFromOpenapiParams } from "../../types";

const queryStringCode = 'const queryString = Object.entries(query).map(([key, value]) => `${key}=${value}`).join(\'&\');\n';
const formDataCode = 'const formData = new FormData(); Object.entries(body).forEach(([key, value]) => formData.append(key, value));\n';

export function generateMethodsCode(methods: ParsedMethod[], params: GenerateClientFromOpenapiParams): string[] {
    return methods.map((method) => generateMethodCode(method, params));
}

export function generateMethodCode(method: ParsedMethod, params: GenerateClientFromOpenapiParams): string {
    const {
        methodName,
        methodType,
        queryParams,
        body,
        response,
    } = method;

    const functionArgs = generateFunctionArgs(method);
    const fetchUrl = generateFetchUrl(method);
    const headersObject = generateHeadersObject(method, params);
    const bodyParam = generateBodyParam(method);

    let fetchCode = `
        const response = await fetch(
            ${fetchUrl},
            {
                method: '${methodType.toUpperCase()}',
                headers: ${headersObject},
                ${bodyParam ? `body: ${bodyParam}` : ''}
            }
        );
    `;

    const functionCode = `
        async ${methodName}(${functionArgs}): Promise<${response ? `types.${response} | null` : 'any'}> {\n
            try {\n
                ${queryParams ? queryStringCode : ''}
                ${body?.type === 'formData' ? formDataCode : ''}
                ${fetchCode}\n
                const responseData = await response.json();\n
                ${response ? `return responseData as types.${response};\n` : 'return responseData'}
            } catch (err: any) {\n
                ${response ? 'return null;\n' : ''}
            }\n
        }
    `;

    return functionCode;
}

function generateFunctionArgs(method: ParsedMethod): string {
    const {
        pathParams,
        queryParams,
        body,
        security,
    } = method;

    const pathParamsCode = generatePathParams(pathParams)

    const functionArgs = _.compact([
        security.authRequired ? 'token: string' : null,
        ...pathParamsCode,
        queryParams ? `query: types.${queryParams}` : null,
        body?.interface ? `body: types.${body.interface}` : null
    ]);

    return functionArgs.join(', ');
}

function generateFetchUrl(method: ParsedMethod): string {
    const {
        methodPath,
        queryParams
    } = method;

    return '`${this.baseApiUrl}' + methodPath.replace(/{/g, '${') + (queryParams ? '?${queryString}`' : '`')
}

function generateHeadersObject(method: ParsedMethod, params: GenerateClientFromOpenapiParams): string {
    const {
        body,
        security
    } = method;

    const headers: { [headerName: string]: string } = { 'Accept': '\'application/json\'' };

    if (body?.type === 'formData') {
        headers['Content-type'] = '\'multipart/form-data\'';
    } else if (body?.type === 'json') {
        headers['Content-type'] = '\'application/json\'';
    }

    if (security.authRequired) {
        headers[params.securityParams.authorizationHeader] = 'token';
    }

    Object.entries(security.apiKeys).forEach(([key, value]) => headers[key] = `this.${value}`);

    return '{ ' + Object.entries(headers).map(([key, value]) => `'${key}': ${value}`).join(', ') + ' }';
}

function generateBodyParam(method: ParsedMethod): string | null {
    const { body } = method;

    if (body?.type === 'formData') {
        return 'formData';
    } else if (body?.type === 'json') {
        return 'JSON.stringify(body)';
    }

    return null;
}

function generatePathParams(pathParams: ParsedMethodPathParams[]): string[] {
    const primitivesMapping: { [key: string]: string } = {
        'string': 'string',
        'number': 'number',
        'integer': 'number',
        'boolean': 'boolean',
        'date': 'string',
        'file': 'File',
        'unknown': 'unknown'
    };

    return pathParams.map((item) => `${item.name}: ${primitivesMapping[item.type]}`);
}
