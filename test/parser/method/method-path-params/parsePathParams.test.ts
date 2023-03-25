import { parsePathParams, ParseMethodPathParamsErrorEnum } from '../../../../src/parser/method/method-path-params';
import { AppError } from '../../../../src/core';
import { Method, MethodParameterType } from '../../../../src/openapi-document';
import { ParsedMethodPathParams } from '../../../../src/parser/types';

interface PositiveTestData {
  description: string;
  inputMethod: Method;
  expectedOutput: ParsedMethodPathParams[];
};

interface NegativeTestData {
  description: string;
  inputMethod: Method;
  expectedError: ParseMethodPathParamsErrorEnum;
};

const successTestData: PositiveTestData[] = [
  {
    description: 'contains primitive path parameters(OAS2)',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "type": "integer"
        },
        {
          "name": "name",
          "in": "path",
          "type": "string"
        },
        {
          "name": "price",
          "in": "path",
          "type": "number",
        }
      ],
      "responses": {}
    },
    expectedOutput: [
      {
        name: 'id',
        type: 'integer'
      },
      {
        name: 'name',
        type: 'string'
      },
      {
        name: 'price',
        type: 'number'
      }
    ]
  },
  {
    description: 'contains primitive path parameters(OAS3)',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "id",
          "in": "path",
          "schema": {
            "type": "integer"
          }
        },
        {
          "name": "name",
          "in": "path",
          "schema": {
            "type": "string"
          }
        },
        {
          "name": "price",
          "in": "path",
          "schema": {
            "type": "number"
          }
        }
      ],
      "responses": {}
    },
    expectedOutput: [
      {
        name: 'id',
        type: 'integer'
      },
      {
        name: 'name',
        type: 'string'
      },
      {
        name: 'price',
        type: 'number'
      }
    ]
  },
  {
    description: 'contains empty parameters(OAS3)',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [],
      "responses": {}
    },
    expectedOutput: []
  },
  {
    description: 'doesn\'t contain parameters(OAS3)',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "responses": {}
    },
    expectedOutput: []
  }
];

const failTestData: NegativeTestData[] = [
  {
    description: 'contains enum type(OAS2)',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "role",
          "in": "path",
          "type": "string",
          "enum": ["player", "customer"]
        }
      ],
      "responses": {}
    },
    expectedError: ParseMethodPathParamsErrorEnum.RequestPathParamMustHavePrimitiveType
  },
  {
    description: 'contains array type(OAS2)',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "role",
          "in": "path",
          "type": "array" as MethodParameterType
        }
      ],
      "responses": {}
    },
    expectedError: ParseMethodPathParamsErrorEnum.RequestPathParamMustHavePrimitiveType
  },
  {
    description: 'contains boolean type(OAS2)',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "role",
          "in": "path",
          "type": "boolean" as MethodParameterType
        }
      ],
      "responses": {}
    },
    expectedError: ParseMethodPathParamsErrorEnum.RequestPathParamMustHavePrimitiveType
  },
  {
    description: 'contains object type(OAS3)',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "role",
          "in": "path",
          "schema": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              }
            }
          }
        }
      ],
      "responses": {}
    },
    expectedError: ParseMethodPathParamsErrorEnum.RequestPathParamMustHavePrimitiveType
  },
  {
    description: 'contains enum type(OAS3)',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "role",
          "in": "path",
          "schema": {
            "type": "string",
            "enum": ["player", "customer"]
          }
        }
      ],
      "responses": {}
    },
    expectedError: ParseMethodPathParamsErrorEnum.RequestPathParamMustHavePrimitiveType
  },
  {
    description: 'contains array type(OAS3)',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "role",
          "in": "path",
          "schema": {
            "type": "array",
            "items": {
              "type": "integer"
            }
          }
        }
      ],
      "responses": {}
    },
    expectedError: ParseMethodPathParamsErrorEnum.RequestPathParamMustHavePrimitiveType
  },
  {
    description: 'contains ref(OAS3)',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "role",
          "in": "path",
          "schema": {
            "$ref": "#/components/schemas/CreateCustomerRequest"
          }
        }
      ],
      "responses": {}
    },
    expectedError: ParseMethodPathParamsErrorEnum.RequestPathParamMustHavePrimitiveType
  }
]

describe('Method path params', () => {
  successTestData.forEach(({ description, inputMethod, expectedOutput }) => {
    it(`Parses method that ${description}`, () => {
      expect(parsePathParams(inputMethod)).toStrictEqual(expectedOutput);
    });
  });

  failTestData.forEach(({ description, inputMethod, expectedError }) => {
    it(`Throws error for method that ${description}`, () => {
      expect(() => parsePathParams(inputMethod)).toThrowError(new AppError(expectedError));
    });
  });
});
