import { GenerateClientFromOpenapiParams } from './types';
import { fetchOpenApiDocument, OpenApiDocument } from './openapi-document';
import { generateDefinitions } from './parser/definition';

export async function generateClient(params: GenerateClientFromOpenapiParams) {
    const openapiDocument: OpenApiDocument = await fetchOpenApiDocument(params.pathToOpenApi);

    if (!openapiDocument.paths || Object.keys(openapiDocument.paths).length === 0) {
        throw Error('Paths not found in OpenApi docment.');
    }

    const definitions = generateDefinitions(openapiDocument.definitions);

    console.log(definitions.interfaces[2].schema.properties);
}

generateClient({
    pathToOpenApi: 'https://core.justdoluck.com/api-docs/swagger.json',
    clientName: 'CoreClient',
    mode: 'basic',
    target: 'typescript-fetch',
    securityParams: {
        apiKeysMapping: { 'Api-Token': 'apiKey' },
        authorizationHeader: 'Authorization'
    }
});
