import { parseBodyParams } from '../../../../src/parser/method/method-body-params';
import { ParseBodyResult, ParseMethodBodyErrorEnum } from '../../../../src/parser/method/method-body-params.types';
import { AppError } from '../../../../src/core';
import { Method } from '../../../../src/openapi-document';
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
    description: 'has body in "requestBody" property with content type specified(OAS3)',
    inputMethod: {
      "operationId": "addCustomer",
      "parameters": [],
      "responses": {}
    },
    expectedOutput: null,
    inputInterfaces: []
  }
];

const failTestData: NegativeTestData[] = [
  {
    description: 'has both in-body "parameters" property and "requestBody" property',
    inputMethod: {
      "operationId": "addCustomer",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CreateCustomerRequest"
            }
          }
        }
      },
      "parameters": [
        {
          "name": "propA",
          "in": "body",
          "required": true,
          "schema": {
            "$ref": "#/definitions/schemaA"
          }
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodBodyErrorEnum.MethodCantContainBothRequestParamsAndBodyParameters
  },
  {
    description: 'has both in-formData "parameters" property and "requestBody" property',
    inputMethod: {
      "operationId": "addCustomer",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CreateCustomerRequest"
            }
          }
        }
      },
      "parameters": [
        {
          "name": "propA",
          "in": "formData",
          "required": true,
          "schema": {
            "$ref": "#/definitions/schemaA"
          }
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodBodyErrorEnum.MethodCantContainBothRequestParamsAndBodyParameters
  }
]

describe('Method body params', () => {
  successTestData.forEach(({ description, inputMethod, inputInterfaces, expectedOutput }) => {
    it(`Parses method that ${description}`, () => {
      expect(parseBodyParams(inputMethod, inputInterfaces)).toStrictEqual(expectedOutput);
    });
  });

  failTestData.forEach(({ description, inputMethod, inputInterfaces, expectedError }) => {
    it(`Throws error for method that ${description}`, () => {
      expect(() => parseBodyParams(inputMethod, inputInterfaces)).toThrowError(new AppError(expectedError));
    });
  });
});
