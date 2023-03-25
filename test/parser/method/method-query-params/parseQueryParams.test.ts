import { parseQueryParams, ParseMethodQueryParamsErrorEnum, ParseQueryResult } from '../../../../src/parser/method/method-query-params';
import { AppError } from '../../../../src/core';
import { Method, MethodParameterType } from '../../../../src/openapi-document';
import { ParsedInterface } from '../../../../src/parser/types';

interface PositiveTestData {
  description: string;
  inputMethod: Method;
  inputInterfaces: ParsedInterface[];
  expectedOutput: ParseQueryResult | null;
};

interface NegativeTestData {
  description: string;
  inputMethod: Method;
  inputInterfaces: ParsedInterface[];
  expectedError: ParseMethodQueryParamsErrorEnum;
};

const successTestData: PositiveTestData[] = [
  {
    description: 'has multiple valid query parameters(OAS2)',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [
        {
          "name": "accepted",
          "in": "query",
          "type": "boolean",
          "required": true
        },
        {
          "name": "start",
          "in": "query",
          "type": "string",
          "required": true
        },
        {
          "name": "finish",
          "in": "query",
          "type": "string",
          "required": true
        },
        {
          "name": "page",
          "in": "query",
          "type": "integer",
          "description": "Page",
          "required": false,
          "default": 1
        },
        {
          "name": "count",
          "in": "query",
          "type": "number",
          "required": false,
          "default": 10
        },
        {
          "name": "type",
          "in": "query",
          "type": "string",
          "enum": ["one-time", "periodic"],
          "required": true,
          "default": 10
        },
        {
          "name": "unknownType",
          "in": "query",
          "default": 10
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: {
      interfaceName: 'GetGamesQueryParams',
      schema: {
        inlineType: 'object',
        properties: {
          accepted: {
            required: true,
            schema: {
              inlineType: 'boolean'
            }
          },
          start: {
            required: true,
            schema: {
              inlineType: 'string'
            }
          },
          finish: {
            required: true,
            schema: {
              inlineType: 'string'
            }
          },
          page: {
            required: false,
            schema: {
              inlineType: 'integer'
            }
          },
          count: {
            required: false,
            schema: {
              inlineType: 'number'
            }
          },
          type: {
            required: true,
            schema: {
              inlineType: 'enum',
              enum: ['one-time', 'periodic']
            }
          },
          unknownType: {
            required: false,
            schema: {
              inlineType: 'unknown'
            }
          }
        }
      }
    }
  },
  {
    description: 'has multiple valid query params(OAS3)',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [
        {
          "name": "accepted",
          "in": "query",
          "schema": {
            "type": "boolean"
          },
          "required": true
        },
        {
          "name": "start",
          "in": "query",
          "schema": {
            "type": "string"
          },
          "required": true
        },
        {
          "name": "finish",
          "in": "query",
          "schema": {
            "type": "string"
          },
          "required": true
        },
        {
          "name": "page",
          "in": "query",
          "schema": {
            "type": "integer"
          },
          "description": "Page",
          "required": false,
          "default": 1
        },
        {
          "name": "count",
          "in": "query",
          "schema": {
            "type": "number"
          },
          "required": false,
          "default": 10
        },
        {
          "name": "type",
          "in": "query",
          "schema": {
            "type": "string",
            "enum": ["one-time", "periodic"]
          },
          "required": true,
          "default": 10
        },
        {
          "name": "unknownType",
          "in": "query",
          "default": 10
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: {
      interfaceName: 'GetGamesQueryParams',
      schema: {
        inlineType: 'object',
        properties: {
          accepted: {
            required: true,
            schema: {
              inlineType: 'boolean'
            }
          },
          start: {
            required: true,
            schema: {
              inlineType: 'string'
            }
          },
          finish: {
            required: true,
            schema: {
              inlineType: 'string'
            }
          },
          page: {
            required: false,
            schema: {
              inlineType: 'integer'
            }
          },
          count: {
            required: false,
            schema: {
              inlineType: 'number'
            }
          },
          type: {
            required: true,
            schema: {
              inlineType: 'enum',
              enum: ['one-time', 'periodic']
            }
          },
          unknownType: {
            required: false,
            schema: {
              inlineType: 'unknown'
            }
          }
        }
      }
    }
  },
  {
    description: 'has empty parameters',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [],
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: null
  },
  {
    description: 'doesn\'t have parameters',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [],
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: null
  },
  {
    description: 'has one query parameter with object schema',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [
        {
          "name": "query",
          "in": "query",
          "schema": {
            "type": "object",
            "properties": {
              "date": {
                "type": "string"
              },
              "type": {
                "type": "string",
                "enum": ["one-time", "periodic"]
              },
              "page": {
                "type": "integer"
              },
              "count": {
                "type": "integer"
              },
              "unknownProperty": {}
            },
            "required": ["date", "type"]
          }
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedOutput: {
      interfaceName: 'GetGamesQueryParams',
      schema: {
        inlineType: 'object',
        properties: {
          date: {
            required: true,
            schema: {
              inlineType: 'string'
            }
          },
          type: {
            required: true,
            schema: {
              inlineType: 'enum',
              enum: ['one-time', 'periodic']
            }
          },
          page: {
            required: false,
            schema: {
              inlineType: 'integer'
            }
          },
          count: {
            required: false,
            schema: {
              inlineType: 'integer'
            }
          },
          unknownProperty: {
            required: false,
            schema: {
              inlineType: 'unknown'
            }
          }
        }
      }
    }
  },
  {
    description: 'has one query parameter with $ref schema',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [
        {
          "name": "query",
          "in": "query",
          "schema": {
            "$ref": "#/definitions/GetGamesRequest"
          }
        }
      ],
      "responses": {}
    },
    inputInterfaces: [
      {
        name: "GetGamesRequest",
        schema: {
          inlineType: 'object',
          properties: {
            date: {
              required: true,
              schema: {
                inlineType: 'string'
              }
            },
            type: {
              required: true,
              schema: {
                inlineType: 'enum',
                enum: ['one-time', 'periodic']
              }
            },
            page: {
              required: false,
              schema: {
                inlineType: 'integer'
              }
            },
            count: {
              required: false,
              schema: {
                inlineType: 'integer'
              }
            },
            unknownProperty: {
              required: false,
              schema: {
                inlineType: 'unknown'
              }
            }
          }
        }
      }
    ],
    expectedOutput: {
      interfaceName: 'GetGamesRequest',
      schema: null
    }
  }
];

const failTestData: NegativeTestData[] = [
  {
    description: 'has file query parameter(OAS2)',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [
        {
          "name": "accepted",
          "in": "query",
          "type": "boolean",
          "required": true
        },
        {
          "name": "randomFileParam",
          "in": "query",
          "type": "file",
          "required": true
        },
        {
          "name": "type",
          "in": "query",
          "type": "string",
          "enum": ["one-time", "periodic"],
          "required": true,
          "default": 10
        },
        {
          "name": "unknownType",
          "in": "query",
          "default": 10
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodQueryParamsErrorEnum.SchemaCantContainObjectsOrFiles
  },
  {
    description: 'has file query param(OAS3)',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [
        {
          "name": "accepted",
          "in": "query",
          "schema": {
            "type": "boolean"
          },
          "required": true
        },
        {
          "name": "randomFileParam",
          "in": "query",
          "schema": {
            "type": "file"
          },
          "required": true
        },
        {
          "name": "type",
          "in": "query",
          "schema": {
            "type": "string",
            "enum": ["one-time", "periodic"]
          },
          "required": true,
          "default": 10
        },
        {
          "name": "unknownType",
          "in": "query",
          "default": 10
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodQueryParamsErrorEnum.SchemaCantContainObjectsOrFiles
  },
  {
    description: 'has object query param(OAS3)',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [
        {
          "name": "accepted",
          "in": "query",
          "schema": {
            "type": "boolean"
          },
          "required": true
        },
        {
          "name": "randomFileParam",
          "in": "query",
          "schema": {
            "type": "object",
            "properties": {
              "someProp": {
                "type": "string"
              }
            }
          },
          "required": true
        },
        {
          "name": "type",
          "in": "query",
          "schema": {
            "type": "string",
            "enum": ["one-time", "periodic"]
          },
          "required": true,
          "default": 10
        },
        {
          "name": "unknownType",
          "in": "query",
          "default": 10
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodQueryParamsErrorEnum.QueryParamsCantContainOtherParamsIfHasObjectParam
  },
  {
    description: 'has referenced query param(OAS3)',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [
        {
          "name": "accepted",
          "in": "query",
          "schema": {
            "type": "boolean"
          },
          "required": true
        },
        {
          "name": "randomParam",
          "in": "query",
          "schema": {
            "$ref": "#/definitions/GetGamesRequest"
          },
          "required": true
        },
        {
          "name": "type",
          "in": "query",
          "schema": {
            "type": "string",
            "enum": ["one-time", "periodic"]
          },
          "required": true,
          "default": 10
        },
        {
          "name": "unknownType",
          "in": "query",
          "default": 10
        }
      ],
      "responses": {}
    },
    inputInterfaces: [
      {
        name: 'GetGamesRequest',
        schema: {
          inlineType: 'object',
          properties: {
            someProp: {
              required: true,
              schema: {
                inlineType: 'string'
              }
            }
          }
        }
      }
    ],
    expectedError: ParseMethodQueryParamsErrorEnum.QueryParamsCantContainOtherParamsIfHasObjectParam
  },
  {
    description: 'has objects array query param(OAS3)',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [
        {
          "name": "accepted",
          "in": "query",
          "schema": {
            "type": "boolean"
          },
          "required": true
        },
        {
          "name": "randomParam",
          "in": "query",
          "schema": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "someProp": {
                  "type": "string"
                }
              }
            }
          },
          "required": true
        },
        {
          "name": "type",
          "in": "query",
          "schema": {
            "type": "string",
            "enum": ["one-time", "periodic"]
          },
          "required": true,
          "default": 10
        },
        {
          "name": "unknownType",
          "in": "query",
          "default": 10
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodQueryParamsErrorEnum.SchemaCantContainObjectsOrFiles
  },
  {
    description: 'has referenced query param(OAS3)',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [
        {
          "name": "query",
          "in": "query",
          "schema": {
            "$ref": "#/definitions/GetGamesRequest"
          },
          "required": true
        }
      ],
      "responses": {}
    },
    inputInterfaces: [],
    expectedError: ParseMethodQueryParamsErrorEnum.SchemaNotFoundInDefinitions
  },
  {
    description: 'has one referenced query param which contains file(OAS3)',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [
        {
          "name": "randomParam",
          "in": "query",
          "schema": {
            "$ref": "#/definitions/GetGamesRequest"
          },
          "required": true
        }
      ],
      "responses": {}
    },
    inputInterfaces: [
      {
        name: 'GetGamesRequest',
        schema: {
          inlineType: 'object',
          properties: {
            someProp: {
              required: true,
              schema: {
                inlineType: 'file'
              }
            }
          }
        }
      }
    ],
    expectedError: ParseMethodQueryParamsErrorEnum.SchemaCantContainObjectsOrFiles
  },
  {
    description: 'has one referenced query param which contains object(OAS3)',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [
        {
          "name": "randomParam",
          "in": "query",
          "schema": {
            "$ref": "#/definitions/GetGamesRequest"
          },
          "required": true
        }
      ],
      "responses": {}
    },
    inputInterfaces: [
      {
        name: 'GetGamesRequest',
        schema: {
          inlineType: 'object',
          properties: {
            someProp: {
              required: true,
              schema: {
                inlineType: 'object'
              }
            }
          }
        }
      }
    ],
    expectedError: ParseMethodQueryParamsErrorEnum.SchemaCantContainObjectsOrFiles
  },
  {
    description: 'has one referenced query param which contains $ref(OAS3)',
    inputMethod: {
      "operationId": "getGames",
      "parameters": [
        {
          "name": "randomParam",
          "in": "query",
          "schema": {
            "$ref": "#/definitions/GetGamesRequest"
          },
          "required": true
        }
      ],
      "responses": {}
    },
    inputInterfaces: [
      {
        name: 'GetGamesRequest',
        schema: {
          inlineType: 'object',
          properties: {
            someProp: {
              required: true,
              schema: {
                customType: 'SomeOtherSchema'
              }
            }
          }
        }
      }
    ],
    expectedError: ParseMethodQueryParamsErrorEnum.SchemaCantContainObjectsOrFiles
  }
]

describe('Method query params', () => {
  successTestData.forEach(({ description, inputMethod, inputInterfaces, expectedOutput }) => {
    it(`Parses method that ${description}`, () => {
      expect(parseQueryParams(inputMethod, inputInterfaces)).toStrictEqual(expectedOutput);
    });
  });

  failTestData.forEach(({ description, inputMethod, inputInterfaces, expectedError }) => {
    it(`Throws error for method that ${description}`, () => {
      expect(() => parseQueryParams(inputMethod, inputInterfaces)).toThrowError(new AppError(expectedError));
    });
  });
});
