import _ from "lodash";
import { InterfaceData } from "../types";

import { RequestBodyType } from "./method-body-params";

export interface GenerateMethodParams {
    methodName: string;
    methodPath: string;
    methodType: string;
    pathParams: string[];
    query: InterfaceData | null | undefined;
    body: InterfaceData | null | undefined;
    response: InterfaceData | null | undefined;
    authHeaderName: string | null;
    apiKeys: { [paramName: string]: string };
    bodyType: RequestBodyType | null | undefined;
};

const queryStringCode = 'const queryString = Object.entries(query).map(([key, value]) => `${key}=${value}`).join(\'\');\n';
const formDataCode = 'const formData = new FormData(); Object.entries(body).forEach(([key, value]) => formData.append(key, value));\n';

export function generateMethod(params: GenerateMethodParams): string {
    const {
        methodName,
        methodType,
        query,
        response,
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

    const responseType = response?.typename ? `types.${response.typename}` : 'void';

    const functionCode = `
        async ${methodName}(${functionArgs}): Promise<${responseType}> {\n
            ${query?.typename ? queryStringCode : ''}
            ${bodyType === 'formData' ? formDataCode : ''}
            ${fetchCode}\n
            const responseData = await response.json();\n
            return responseData as ${responseType};\n
        }
    `;

    return functionCode;
}

function generateFunctionArgs(params: GenerateMethodParams): string {
    const {
        pathParams,
        query,
        body,
        authHeaderName,
    } = params;

    const functionArgs = _.compact([
        authHeaderName ? 'token: string' : null,
        ...pathParams,
        query?.typename ? `query: types.${query.typename}` : null,
        body?.typename ? `body: types.${body.typename}` : null
    ]);

    return functionArgs.join(', ');
}

function generateFetchUrl(params: GenerateMethodParams): string {
    const {
        methodPath,
        query
    } = params;

    return '`${this.baseApiUrl}' + methodPath.replace('{', '${') + (query?.typename ? '?${queryString}`' : '`')
}

function generateHeadersObject(params: GenerateMethodParams): string {
    const {
        body,
        authHeaderName,
        apiKeys,
        bodyType
    } = params;

    const headers: { [headerName: string]: string } = { 'Accept': '\'application/json\'' };

    if (body?.typename && bodyType === 'formData') {
        headers['Content-type'] = '\'multipart/form-data\'';
    } else if (body?.typename && bodyType === 'json') {
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
        body,
        bodyType
    } = params;

    if (body?.typename && bodyType === 'formData') {
        return 'formData';
    } else if (body?.typename && bodyType === 'json') {
        return 'JSON.stringify(body)';
    }

    return null;
}