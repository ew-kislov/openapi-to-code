import { parseBodyParamsFromRequestBody } from '../../../../src/parser/method/method-body-params-from-request-body';
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
    description: 'schema with $ref in "requestBody" property and "application/json" media type',
    inputMethod: {
      "operationId": "addCustomer",
      "parameters": [],
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
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: {
      interfaceName: 'CreateCustomerRequest',
      schema: null,
      bodyType: 'json',
      required: true
    }
  },
  {
    description: 'doesn\'t have "requestBody"',
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
    description: 'has object schema in "requestBody" property and "application/json" media type',
    inputMethod: {
      "operationId": "addCustomer",
      "parameters": [],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "integer"
                },
                "name": {
                  "type": "string"
                },
                "role": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string"
                    }
                  }
                }
              },
              "required": ["id"]
            }
          }
        }
      },
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: {
      interfaceName: 'AddCustomerBodyParams',
      schema: {
        inlineType: "object",
        properties: {
          id: {
            required: true,
            schema: {
              inlineType: 'integer'
            }
          },
          name: {
            required: false,
            schema: {
              inlineType: 'string'
            }
          },
          role: {
            required: false,
            schema: {
              inlineType: 'object',
              properties: {
                name: {
                  required: false,
                  schema: {
                    inlineType: 'string'
                  }
                }
              }
            }
          }
        }
      },
      bodyType: 'json',
      required: true
    }
  },
  {
    description: 'has object schema in "requestBody" property and "application/x-www-form-urlencoded" media type',
    inputMethod: {
      "operationId": "addCustomer",
      "parameters": [],
      "requestBody": {
        "required": true,
        "content": {
          "application/x-www-form-urlencoded": {
            "schema": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "integer"
                }
              }
            }
          }
        }
      },
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: {
      interfaceName: 'AddCustomerBodyParams',
      schema: {
        inlineType: "object",
        properties: {
          id: {
            required: false,
            schema: {
              inlineType: 'integer'
            }
          }
        }
      },
      bodyType: 'formData',
      required: true
    }
  },
  {
    description: 'has object schema in "requestBody" property and "multipart/form-data" media type',
    inputMethod: {
      "operationId": "addCustomer",
      "parameters": [],
      "requestBody": {
        "required": true,
        "content": {
          "multipart/form-data": {
            "schema": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "integer"
                },
                "photo": {
                  "type": "file"
                }
              }
            }
          }
        }
      },
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: {
      interfaceName: 'AddCustomerBodyParams',
      schema: {
        inlineType: "object",
        properties: {
          id: {
            required: false,
            schema: {
              inlineType: 'integer'
            }
          },
          photo: {
            required: false,
            schema: {
              inlineType: 'file'
            }
          }
        }
      },
      bodyType: 'formData',
      required: true
    }
  }
];

const failTestData: NegativeTestData[] = [
  {
    description: 'has body in "requestBody" property with requestBodies component',
    inputMethod: {
      "operationId": "addCustomer",
      "requestBody": {
        "$ref": "#/components/requestBodies/CreateCustomerRequest"
      },
      "responses": {}
    } as unknown as Method,
    inputInterfaces: [],
    expectedError: ParseMethodBodyErrorEnum.RequestBodyMustHaveContentProp
  },
  {
    description: 'doesn\'t have "content" property',
    inputMethod: {
      "operationId": "addCustomer",
      "requestBody": {
      },
      "responses": {}
    } as unknown as Method,
    inputInterfaces: [],
    expectedError: ParseMethodBodyErrorEnum.RequestBodyMustHaveContentProp
  },
  {
    description: 'doesn\'t have "schema" property',
    inputMethod: {
      "operationId": "addCustomer",
      "requestBody": {
        "content": {
          "application/json": {
          }
        }
      },
      "responses": {}
    } as unknown as Method,
    inputInterfaces: [],
    expectedError: ParseMethodBodyErrorEnum.RequestBodyMustHaveSchemaProp
  },
  {
    description: 'has unsupported media type',
    inputMethod: {
      "operationId": "addCustomer",
      "requestBody": {
        "required": true,
        "content": {
          "application/javascript": {
            "schema": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "integer"
                }
              }
            }
          }
        }
      },
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodBodyErrorEnum.RequestBodyWrongMediaType
  },
  {
    description: 'has file properties for "application/json" media type',
    inputMethod: {
      "operationId": "addCustomer",
      "parameters": [],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "integer"
                },
                "photo": {
                  "type": "file"
                }
              }
            }
          }
        }
      },
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodBodyErrorEnum.FileParametersAllowedOnlyInFormDataParameters
  },
  {
    description: 'has file properties for "application/json" media type',
    inputMethod: {
      "operationId": "addCustomer",
      "parameters": [],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "integer"
                },
                "photo": {
                  "type": "file"
                }
              }
            }
          }
        }
      },
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodBodyErrorEnum.FileParametersAllowedOnlyInFormDataParameters
  },
  {
    description: 'has "multipart/form-data" media type and contains nested objects',
    inputMethod: {
      "operationId": "addCustomer",
      "parameters": [],
      "requestBody": {
        "required": true,
        "content": {
          "multipart/form-data": {
            "schema": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "integer"
                },
                "name": {
                  "type": "string"
                },
                "role": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string"
                    }
                  }
                }
              },
              "required": ["id"]
            }
          }
        }
      },
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodBodyErrorEnum.ObjectItemsAreAllowedOnlyInJsonRequestBody
  }
]

describe('Method body params in "requestBody" property(OAS3)', () => {
  successTestData.forEach(({ description, inputMethod, inputInterfaces, expectedOutput }) => {
    it(`Parses method that ${description}`, () => {
      expect(parseBodyParamsFromRequestBody(inputMethod, inputInterfaces)).toStrictEqual(expectedOutput);
    });
  });

  failTestData.forEach(({ description, inputMethod, inputInterfaces, expectedError }) => {
    it(`Throws error for method that ${description}`, () => {
      expect(() => parseBodyParamsFromRequestBody(inputMethod, inputInterfaces)).toThrowError(new AppError(expectedError));
    });
  });
});
