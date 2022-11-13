import * as schemaParser from '../schema';
import { Schema, Definitions } from '../types';

export interface GenerateDefenitionsResult {
    interfacesAsCode: string[];
}

export function generateDefinitions(definitions: Definitions | undefined): GenerateDefenitionsResult {
    if (!definitions || Object.keys(definitions).length === 0) {
        return { interfacesAsCode: [] };
    }

    const interfacesAsCode = Object.entries(definitions).map(([definitionName, definition]) => {
        return generateDefinition(definitionName, definition);
    });

    return { interfacesAsCode };
}

export function generateDefinition(definitionName: string, definition: Schema): string {
    if (!schemaParser.isObject(definition)) {
        throw Error(`Definition ${definitionName} must have "object" type`);
    }

    return `export interface ${definitionName} ${schemaParser.generateObject(definition)}`;
}
