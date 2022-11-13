import _ from "lodash";

import { RequestBodyType } from "./method-body-params";

export interface GenerateMethodParams {
    methodName: string;
    methodPath: string;
    methodType: string;
    pathParams: string[];
    queryTypename: string | null;
    bodyTypename: string | null;
    responseTypename: string | null;
    authHeaderName: string | null;
    apiKeys: { [paramName: string]: string };
    bodyType: RequestBodyType;
};

const queryStringCode = 'const queryString = Object.entries(query).map(([key, value]) => `${key}=${value}`).join(\'\');\n';
const formDataCode = 'const formData = new FormData(); Object.entries(body).forEach(([key, value]) => formData.append(key, value));\n';

export function generateMethod(params: GenerateMethodParams): string {
    const {
        methodName,
        methodType,
        queryTypename,
        responseTypename,
        bodyType
    } = params;

    const functionArgs = generateFunctionArgs(params);
    const fetchUrl = generateFetchUrl(params);
    const headersObject = generateHeadersObject(params);
    const bodyParam = generateBodyParam(params);

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
        async ${methodName}(${functionArgs}): Promise<${responseTypename ? `types.${responseTypename}` : 'void'}> {\n
            ${queryTypename ? queryStringCode : ''}
            ${bodyType === 'formData' ? formDataCode : ''}
            ${fetchCode}\n
            const responseData = await response.json();\n
            return responseData;\n
        }
    `;

    return functionCode;
}

function generateFunctionArgs(params: GenerateMethodParams): string {
    const {
        pathParams,
        queryTypename,
        bodyTypename,
        authHeaderName,
    } = params;

    const functionArgs = _.compact([
        authHeaderName ? 'token: string' : null,
        ...pathParams,
        queryTypename ? `query: types.${queryTypename}` : null,
        bodyTypename ? `body: types.${bodyTypename}` : null
    ]);

    return functionArgs.join(', ');
}

function generateFetchUrl(params: GenerateMethodParams): string {
    const {
        methodPath,
        queryTypename
    } = params;

    return '`${this.baseApiUrl}' + methodPath.replace('{', '${') + (queryTypename ? '?${queryString}`' : '`')
}

function generateHeadersObject(params: GenerateMethodParams): string {
    const {
        bodyTypename,
        authHeaderName,
        apiKeys,
        bodyType
    } = params;

    const headers: { [headerName: string]: string } = { 'Accept': '\'application/json\'' };

    if (bodyTypename && bodyType === 'formData') {
        headers['Content-type'] = '\'multipart/form-data\'';
    } else if (bodyTypename && bodyType === 'json') {
        headers['Content-type'] = '\'application/json\'';
    }

    if (authHeaderName) {
        headers[authHeaderName] = 'token';
    }

    Object.entries(apiKeys).forEach(([key, value]) => headers[key] = `this.${value}`);

    return '{ ' + Object.entries(headers).map(([key, value]) => `'${key}': ${value}`).join(', ') + ' }';
}

function generateBodyParam(params: GenerateMethodParams): string | null {
    const {
        bodyTypename,
        bodyType
    } = params;

    if (bodyTypename && bodyType === 'formData') {
        return 'formData';
    } else if (bodyTypename && bodyType === 'json') {
        return 'JSON.stringify(body)';
    }

    return null;
}