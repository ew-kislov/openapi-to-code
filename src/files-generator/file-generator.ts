import fsp from 'fs/promises';
import { exec } from 'child_process';

import { GenerateClientFromOpenapiParams } from "../types";
import { GenerateDefenitionsResult } from "../definition";
import { GenerateMethodsResult } from "../method";

export async function generateFiles(
    params: GenerateClientFromOpenapiParams,
    definitions: GenerateDefenitionsResult,
    methods: GenerateMethodsResult
): Promise<void> {
    const methodsAsCode = methods.methodsAsCode;
    const interfacesAsCode = [
        ...definitions.interfacesAsCode,
        ...methods.interfacesAsCode
    ];

    const typesPreset = (interfacesAsCode.length !== 0);

    await initDirectories();

    await generateTypesFile(interfacesAsCode);
    await generateIndexFile(params, methodsAsCode, typesPreset);

    await formatCode();
}

async function initDirectories(): Promise<void> {
    await fsp.rm('generated', { recursive: true, force: true });
    await fsp.mkdir('generated');
}

async function generateTypesFile(interfaces: string[]): Promise<void> {
    const typesTemplate = (await fsp.readFile('templates/types.ts-template')).toString();

    const interfacesAsString = interfaces.join('\n\n');
    const interfacesSourceCode = typesTemplate.replace('{types}', interfacesAsString);

    await fsp.writeFile('generated/types.ts', interfacesSourceCode);
}

async function generateIndexFile(
    params: GenerateClientFromOpenapiParams,
    methods: string[],
    typesPreset: boolean
): Promise<void> {
    const indexTemplate = (await fsp.readFile('templates/index.ts-template')).toString();

    const methodsAsString = methods.join('\n\n');

    const apiKeyNames = Object.values(params.securityParams.apiKeysMapping);

    const apiKeysDefinitions = apiKeyNames.map((key) => `private readonly ${key}: string`).join('\n');
    const apiKeysParams = apiKeyNames.map((key) => `${key}: string`).join(', ');
    const apiKeysInitialization = apiKeyNames.map((key) => `this.${key} = ${key};`).join('\n');

    const methodsSourceCode = indexTemplate
        .replace('{types_import}', typesPreset ? `import * as types from './types'` : '')
        .replace('{api_keys_definitions}', apiKeysDefinitions)
        .replace('{api_keys_params}', apiKeysParams)
        .replace('{api_keys_initialization}', apiKeysInitialization)
        .replace('{methods}', methodsAsString);

    await fsp.writeFile('generated/index.ts', methodsSourceCode);
}

async function formatCode(): Promise<void> {
    return new Promise((resolve, reject) =>
        exec('npx prettier --write ./generated', (error) => error ? reject(error) : resolve())
    );
}