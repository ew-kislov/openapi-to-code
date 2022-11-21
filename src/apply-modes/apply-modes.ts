import { ParsedDocument } from '../parser';
import { GenerationMode } from '../types';

import * as interMicroservice from './inter-microservice';

type GenerationFunction = (document: ParsedDocument) => ParsedDocument;

const targetsMap: { [key: string]: GenerationFunction } = {
    'basic': (document: ParsedDocument) => document,
    'inter-microservice': interMicroservice.applyModeToParsedDocument
};

export function applyModeToParsedDocument(document: ParsedDocument, mode: GenerationMode): ParsedDocument {
    if (targetsMap[mode]) {
        return targetsMap[mode](document);
    } else {
        throw new Error(`Unknown generation mode - ${mode}`);
    }
}
