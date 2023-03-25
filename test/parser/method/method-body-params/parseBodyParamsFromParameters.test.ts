import { parseBodyParamsFromParameters } from '../../../../src/parser/method/method-body-params-from-parameters';
import { ParseBodyResult, ParseMethodBodyErrorEnum } from '../../../../src/parser/method/method-body-params.types';
import { AppError } from '../../../../src/core';
import { Method, MethodParameterType, ParameterIn } from '../../../../src/openapi-document';
import { ParsedInterface } from '../../../../src/parser/types';

interface PositiveTestData {
  description: string;
  inputMethod: Method;
  inputInterfaces: ParsedInterface[];
  expectedOutput: ParseBodyResult | null;
};

interface NegativeTestData {
  description: string;
  inputMethod: Method;
  inputInterfaces: ParsedInterface[];
  expectedError: ParseMethodBodyErrorEnum;
};

const successTestData: PositiveTestData[] = [
  {
    description: 'has formData body in "parameters" property',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "name",
          "in": "formData" as ParameterIn,
          "type": "string" as MethodParameterType
        },
        {
          "name": "type",
          "in": "formData" as ParameterIn,
          "type": "string" as MethodParameterType,
          "required": true,
          "description": "electronic, material, mixed, money"
        },
        {
          "name": "photo",
          "in": "formData" as ParameterIn,
          "type": "file" as MethodParameterType,
          "required": true
        },
        {
          "name": "createdBy",
          "in": "formData" as ParameterIn,
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: {
      interfaceName: 'CreatePrizesBodyParams',
      schema: {
        inlineType: 'object',
        properties: {
          name: {
            schema: {
              inlineType: 'string'
            },
            required: false,
          },
          type: {
            schema: {
              inlineType: 'string'
            },
            required: true,
          },
          photo: {
            schema: {
              inlineType: 'file'
            },
            required: true,
          },
          createdBy: {
            schema: {
              inlineType: 'unknown'
            },
            required: false
          }
        }
      },
      bodyType: 'formData',
      required: true
    }
  },
  {
    description: 'has one "parameters" item as a schema with $ref',
    inputMethod: {
      "operationId": "createFeedback",
      "tags": [
        "Player"
      ],
      "parameters": [
        {
          "name": "body",
          "in": "body" as ParameterIn,
          "required": true,
          "schema": {
            "$ref": "#/definitions/CreateFeedbackRequest"
          }
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: {
      interfaceName: 'CreateFeedbackRequest',
      schema: null,
      bodyType: 'json',
      required: true
    }
  },
  {
    description: 'doesn\'t have "parameters"',
    inputMethod: {
      "operationId": "createFeedback",
      "tags": [
        "Player"
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: null
  },
  {
    description: 'doesn\'t have "requestBody" and has empty "parameters"',
    inputMethod: {
      "operationId": "createFeedback",
      "tags": [
        "Player"
      ],
      "parameters": [],
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: null
  },
  {
    description: 'has schema with "integer" type in in-body "parameters" property',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "name",
          "in": "body" as ParameterIn,
          "schema": {
            "type": "integer"
          }
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: {
      interfaceName: 'CreatePrizesBodyParams',
      schema: {
        inlineType: 'integer'
      },
      bodyType: 'json',
      required: false
    }
  },
  {
    description: 'has schema with required "integer" type in in-body "parameters" property',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "name",
          "in": "body" as ParameterIn,
          "schema": {
            "type": "integer"
          },
          "required": true
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: {
      interfaceName: 'CreatePrizesBodyParams',
      schema: {
        inlineType: 'integer'
      },
      bodyType: 'json',
      required: true
    }
  }
];

const failTestData: NegativeTestData[] = [
  {
    description: 'has more than 1 parameters with schema containing object',
    inputMethod: {
      "operationId": "addCustomer",
      "parameters": [
        {
          "name": "propA",
          "in": "body",
          "required": true,
          "schema": {
            "$ref": "#/definitions/schemaA"
          }
        },
        {
          "name": "propB",
          "in": "body",
          "required": true,
          "schema": {
            "$ref": "#/definitions/schemaB"
          }
        }
      ],
      "responses": {}
    },
    inputInterfaces: [
      {
        name: 'schemaA',
        schema: {
          inlineType: 'object',
          properties: {
            name: {
              required: true,
              schema: {
                inlineType: 'string'
              }
            }
          }
        }
      },
      {
        name: 'schemaB',
        schema: {
          inlineType: 'string',
          enum: ['a', 'b']
        }
      }
    ],
    expectedError: ParseMethodBodyErrorEnum.InBodyParamMustBeExactlyOneWithSchema
  },
  {
    description: 'has object item in in-formData "parameters" property',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "name",
          "in": "formData" as ParameterIn,
          "type": "string" as MethodParameterType
        },
        {
          "name": "type",
          "in": "formData" as ParameterIn,
          "type": "string" as MethodParameterType,
          "required": true,
          "description": "electronic, material, mixed, money"
        },
        {
          "name": "photo",
          "in": "formData" as ParameterIn,
          "type": "object" as MethodParameterType,
          "required": true
        },
        {
          "name": "createdBy",
          "in": "formData" as ParameterIn,
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodBodyErrorEnum.FormDataParametersMustHavePrimitiveType
  },
  {
    description: 'has formData-style items in in-body "parameters" property',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "name",
          "in": "body" as ParameterIn,
          "type": "string" as MethodParameterType
        },
        {
          "name": "type",
          "in": "body" as ParameterIn,
          "type": "string" as MethodParameterType,
          "required": true,
          "description": "electronic, material, mixed, money"
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodBodyErrorEnum.InBodyParamMustBeExactlyOneWithSchema
  },
  {
    description: 'has both in-formData and in-body items in "parameters" property',
    inputMethod: {
      "operationId": "createPrizes",
      "tags": [
        "Customer Presets"
      ],
      "parameters": [
        {
          "name": "name",
          "in": "formData" as ParameterIn,
          "type": "string" as MethodParameterType
        },
        {
          "name": "type",
          "in": "body" as ParameterIn,
          "type": "string" as MethodParameterType,
          "required": true,
          "description": "electronic, material, mixed, money"
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodBodyErrorEnum.MethodCantContainBothFormDataAndBodyParameters
  }
]

describe('Method body params in "parameters" property(OAS2)', () => {
  successTestData.forEach(({ description, inputMethod, inputInterfaces, expectedOutput }) => {
    it(`Parses method that ${description}`, () => {
      expect(parseBodyParamsFromParameters(inputMethod, inputInterfaces)).toStrictEqual(expectedOutput);
    });
  });

  failTestData.forEach(({ description, inputMethod, inputInterfaces, expectedError }) => {
    it(`Throws error for method that ${description}`, () => {
      expect(() => parseBodyParamsFromParameters(inputMethod, inputInterfaces)).toThrowError(new AppError(expectedError));
    });
  });
});
