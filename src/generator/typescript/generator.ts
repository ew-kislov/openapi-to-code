import { exec } from 'child_process';
import fsp from 'fs/promises';

import { ParsedDocument } from "../../parser/types";
import { GenerateClientFromOpenapiParams } from "../../types";
import { generateInterfacesCode } from "./interface";
import { generateMethodsCode } from './method';

export async function generate(document: ParsedDocument, params: GenerateClientFromOpenapiParams) {
    const interfacesCode: string[] = generateInterfacesCode(document.interfaces);
    const methodsCode: string[] = generateMethodsCode(document.methods, params);

    const interfacesPreset = interfacesCode.length !== 0;

    await initDirectories();

    await generateTypesFile(interfacesCode);
    await generateIndexFile(params, methodsCode, interfacesPreset);

    await formatCode();
}

async function initDirectories(): Promise<void> {
    await fsp.rm('generated', { recursive: true, force: true });
    await fsp.mkdir('generated');
}

async function generateTypesFile(interfaces: string[]): Promise<void> {
    const typesTemplate = (await fsp.readFile('templates/typescript-fetch/types.ts-template')).toString();

    const interfacesAsString = interfaces.map((item) => item).join('\n\n');
    const interfacesSourceCode = typesTemplate.replace('{types}', interfacesAsString);

    await fsp.writeFile('generated/types.ts', interfacesSourceCode);
}

async function generateIndexFile(
    params: GenerateClientFromOpenapiParams,
    methods: string[],
    interfacesPreset: boolean
): Promise<void> {
    const indexTemplate = (await fsp.readFile('templates/typescript-fetch/index.ts-template')).toString();

    const methodsAsString = methods.map((method) => method).join('\n\n');

    const apiKeyNames = Object.values(params.securityParams.apiKeysMapping);

    const apiKeysDefinitions = apiKeyNames.map((key) => `private readonly ${key}: string`).join('\n');
    const apiKeysParams = apiKeyNames.map((key) => `${key}: string`).join(', ');
    const apiKeysInitialization = apiKeyNames.map((key) => `this.${key} = ${key};`).join('\n');

    const methodsSourceCode = indexTemplate
        .replace('{types_import}', interfacesPreset ? `import * as types from './types'` : '')
        .replace('{api_keys_definitions}', apiKeysDefinitions)
        .replace('{api_keys_params}', apiKeysParams)
        .replace('{api_keys_initialization}', apiKeysInitialization)
        .replace('{methods}', methodsAsString)
        .replace('{client_name}', params.clientName);

    await fsp.writeFile('generated/index.ts', methodsSourceCode);
}

async function formatCode(): Promise<void> {
    return new Promise((resolve, reject) =>
        exec('npx prettier --write ./generated', (error) => error ? reject(error) : resolve())
    );
}
