import * as schemaParser from '../schema';
import { Schema, Definitions } from '../../openapi-document';
import { ParsedInterfaceData } from './types';

export interface GenerateDefenitionsResult {
    interfaces: ParsedInterfaceData[];
}

export function generateDefinitions(definitions: Definitions | undefined): GenerateDefenitionsResult {
    if (!definitions || Object.keys(definitions).length === 0) {
        return { interfaces: [] };
    }

    const interfaces = Object.entries(definitions).map(([definitionName, definition]) => {
        return generateDefinition(definitionName, definition);
    });

    return { interfaces };
}

export function generateDefinition(definitionName: string, definition: Schema): ParsedInterfaceData {
    if (!schemaParser.isObject(definition)) {
        throw Error(`Definition ${definitionName} must have "object" type`);
    }

    return {
        name: definitionName,
        schema: schemaParser.generateObject(definition, true),
    };
}
