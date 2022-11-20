import { GenerateClientFromOpenapiParams } from './types';
import { fetchOpenApiDocument, OpenApiDocument } from './openapi-document';
import { parseDocument } from './parser';
import { generateFromParsedDocument } from './generator';

export async function generateClient(params: GenerateClientFromOpenapiParams) {
    const openapiDocument: OpenApiDocument = await fetchOpenApiDocument(params.pathToOpenApi);

    const parsedDocument = parseDocument(openapiDocument, params);

    await generateFromParsedDocument(parsedDocument, params);
}
