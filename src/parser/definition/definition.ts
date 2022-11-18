import { Schema, Definitions } from '../../openapi-document';
import { ParsedInterface } from '../types';
import * as schemaParser from '../schema';

export interface ParseDefenitionsResult {
    interfaces: ParsedInterface[];
}

export function parseDefinitions(definitions: Definitions | undefined): ParseDefenitionsResult {
    if (!definitions || Object.keys(definitions).length === 0) {
        return { interfaces: [] };
    }

    const interfaces = Object.entries(definitions).map(([definitionName, definition]) => {
        return parseDefinition(definitionName, definition);
    });

    return { interfaces };
}

export function parseDefinition(definitionName: string, definition: Schema): ParsedInterface {
    if (!schemaParser.isObject(definition)) {
        throw Error(`Definition ${definitionName} must have "object" type`);
    }

    return {
        name: definitionName,
        schema: schemaParser.parseObject(definition),
    };
}
