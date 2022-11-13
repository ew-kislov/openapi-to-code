import { GenerateClientFromOpenapiParams, OpenApiDocument } from './types';
import { generateDefinitions } from './definition';
import { generateMethods } from './method';
import { parseOpenApiDocument } from './parser';
import { generateFiles } from './files-generator';

export async function generateClient(params: GenerateClientFromOpenapiParams) {
    const openapiDocument: OpenApiDocument = await parseOpenApiDocument(params.pathToOpenApi);

    if (!openapiDocument.paths || Object.keys(openapiDocument.paths).length === 0) {
        throw Error('Paths not found in OpenApi docment.');
    }

    const definitions = generateDefinitions(openapiDocument.definitions);
    const methods = generateMethods(openapiDocument.paths, params.securityParams);

    await generateFiles(params, definitions, methods);
}
