import { GenerateClientFromOpenapiParams } from "../../types";
import { OpenApiDocument } from "../../openapi-document";
import { parseDefinitions } from "../definition";
import { parseMethods } from "../method";
import { ParsedDocument } from "../types";

export function parseDocument(openapiDocument: OpenApiDocument, params: GenerateClientFromOpenapiParams): ParsedDocument {
    if (!openapiDocument.paths || Object.keys(openapiDocument.paths).length === 0) {
        throw Error('Paths not found in OpenApi docment.');
    }

    const parseDefinitionsResult = parseDefinitions(openapiDocument.definitions ?? openapiDocument?.components?.schemas);
    const parseMethodsResult = parseMethods(openapiDocument.paths, params.securityParams, parseDefinitionsResult.interfaces);

    return {
        methods: parseMethodsResult.methods,
        interfaces: [...parseDefinitionsResult.interfaces, ...parseMethodsResult.interfaces]
    };
}
