import axios from 'axios';
import yaml from 'js-yaml';

import { OpenApiDocument } from "./types";

export async function fetchOpenApiDocument(pathToOpenApi: string): Promise<OpenApiDocument> {
    const response = await axios({ method: 'GET', url: pathToOpenApi, transformResponse: (r) => r });

    const responseBody = await response.data;

    try {
        return JSON.parse(responseBody) as OpenApiDocument;
    } catch (error) {
    }

    try {
        return yaml.load(responseBody) as OpenApiDocument;
    } catch (error) {
    }

    throw Error('Wrong format: document must have either JSON or YAML format.');
}