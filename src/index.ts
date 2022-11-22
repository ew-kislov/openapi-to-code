import { GenerateClientFromOpenapiParams } from './types';
import { fetchOpenApiDocument, OpenApiDocument } from './openapi-document';
import { parseDocument } from './parser';
import { generateFromParsedDocument } from './generator';
import { applyModeToParsedDocument } from './apply-modes';

export async function generateClient(params: GenerateClientFromOpenapiParams) {
    const openapiDocument: OpenApiDocument = await fetchOpenApiDocument(params.pathToOpenApi);

    const parsedDocument = parseDocument(openapiDocument, params);
    const documentWithMode = applyModeToParsedDocument(parsedDocument, params.mode ?? 'basic');

    await generateFromParsedDocument(documentWithMode, params);
}

generateClient({
    pathToOpenApi: 'https://core.justdoluck.com/api-docs/swagger.json',
    clientName: 'CoreClient',
    mode: 'inter-microservice',
    target: 'typescript-fetch',
    securityParams: {
        apiKeysMapping: { 'Api-Token': 'apiKey' },
        authorizationHeader: 'Authorization'
    }
});
