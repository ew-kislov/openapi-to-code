import _ from "lodash";

import { ParsedDocument, ParsedInterface } from "../../parser";

export function applyModeToParsedDocument(document: ParsedDocument): ParsedDocument {
    const { interfaces, methods } = document;

    const newMethods = methods
        .filter((method) => method.methodPath.includes('internal'))
        .map((method) => ({ ...method, methodName: method.methodName.replace(/internal|Internal/, '') }));

    const newInterfaces: ParsedInterface[] = [];

    newMethods.forEach((method) => {
        const { queryParams, body, response } = method;
        const nestedInQueryParams = queryParams ? getNestedInterfaces(queryParams, interfaces) : [];
        const nestedInBodyParams = body ? getNestedInterfaces(body.interface, interfaces) : [];
        const nestedInResponseParams = response ? getNestedInterfaces(response, interfaces) : [];

        const totalInterfaces: ParsedInterface[] = _.compact([
            ...nestedInQueryParams,
            ...nestedInBodyParams,
            ...nestedInResponseParams
        ]);

        newInterfaces.push(...totalInterfaces);
    });

    return { interfaces: newInterfaces, methods: newMethods };
}

export function getNestedInterfaces(interfaceName: string, interfaces: ParsedInterface[]): ParsedInterface[] {
    const totalInterfaces: ParsedInterface[] = [];
    const totalInterfaceNames: string[] = [];

    const rootInterface = interfaces.find((item) => item.name === interfaceName);
    if (!rootInterface) {
        return [];
    }

    const queue = [rootInterface];

    while (queue.length !== 0) {
        const current = queue.shift();

        const props = current!.schema.properties;
        if (!props) {
            continue;
        }

        const nestedNames = Object.values((props))
            .filter((item) => item.schema.customType || item.schema.itemsSchema?.customType)
            .map((item) => item.schema.customType ?? item.schema.itemsSchema?.customType)
            .filter((item) => !totalInterfaceNames.includes(item!));

        const nestedInterfaces = interfaces.filter((item) => nestedNames.includes(item.name));

        queue.push(...nestedInterfaces);

        totalInterfaces.push(current!);
        totalInterfaceNames.push(current!.name)
    }

    return totalInterfaces;
}