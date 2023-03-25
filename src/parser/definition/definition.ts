import { Schema, Definitions } from '../../openapi-document';
import { ParsedInterface } from '../types';
import * as schemaParser from '../schema';
import { log, LogLevel, setGlobalContext } from '../../global-logger';

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

export function parseDefinition(definitionNameRaw: string, definition: Schema): ParsedInterface {
    const definitionName = definitionNameRaw.replace(/'/gi, '');

    setGlobalContext({ definition: definitionName });

    if (!schemaParser.isObject(definition)) {
        log(`Definition ${definitionName} must have "object" type`, LogLevel.Error);
        process.exit(1);
    }

    return {
        name: definitionName,
        schema: schemaParser.parseObject(definition),
    };
}
