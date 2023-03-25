import { ParsedDocument } from '../parser';
import { GenerateClientFromOpenapiParams } from '../types';

import * as typescript from './typescript';

type GenerationFunction = (document: ParsedDocument, params: GenerateClientFromOpenapiParams) => Promise<void>;

const targetsMap: { [key: string]: GenerationFunction } = {
    'typescript-fetch': typescript.generate
};

export async function generateFromParsedDocument(document: ParsedDocument, params: GenerateClientFromOpenapiParams) {
    if (targetsMap[params.target]) {
        await targetsMap[params.target](document, params);
    } else {
        throw new Error(`Unknown generation target - ${params.target}`);
    }
}
