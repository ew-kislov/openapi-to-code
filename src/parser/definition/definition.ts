import { Schema, Definitions } from '../../openapi-document';
import { ParsedInterface } from '../types';
import * as schemaParser from '../schema';
import { setGlobalContext } from '../../global-logger';
import { AppError } from '../../core';

export enum ParseDefinitionErrorEnum {
    DefinitionNameCantContainSpecialSymbols = 'Definition name can\'t contain special symbols'
};

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
    if (new RegExp(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/).test(definitionName)) {
        throw new AppError(ParseDefinitionErrorEnum.DefinitionNameCantContainSpecialSymbols);
    }

    setGlobalContext({ definition: definitionName });

    return {
        name: definitionName,
        schema: schemaParser.parseSchema(definition)
    };
}
