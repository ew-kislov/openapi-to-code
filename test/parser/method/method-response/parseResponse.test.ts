import { parseResponse, ParseMethodResponseErrorEnum, ParseBodyResult } from '../../../../src/parser/method/method-response';
import { AppError } from '../../../../src/core';
import { Method } from '../../../../src/openapi-document';

interface PositiveTestData {
  description: string;
  inputMethod: Method;
  expectedOutput: ParseBodyResult | null;
};

interface NegativeTestData {
  description: string;
  inputMethod: Method;
  expectedError: ParseMethodResponseErrorEnum;
};

const successTestData: PositiveTestData[] = [
  {
    description: 'has response with referenced type without content type',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
        "200": {
          "description": "Success",
          "schema": {
            "$ref": "#/definitions/CustomerGamesResponse"
          }
        }
      }
    },
    expectedOutput: {
      interfaceName: 'CustomerGamesResponse',
      schema: null
    }
  },
  {
    description: 'has response with object type without content type',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
        "200": {
          "description": "Success",
          "schema": {
            "type": "object",
            "properties": {
              "id": {
                "type": "integer"
              },
              "name": {
                "type": "string"
              }
            },
            "required": ["id"]
          }
        }
      }
    },
    expectedOutput: {
      interfaceName: 'GetGamesResponse',
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
          }
        }
      }
    }
  },
  {
    description: 'has response with referenced type with content type',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/definitions/CustomerGamesResponse"
              }
            }
          }
        }
      }
    },
    expectedOutput: {
      interfaceName: 'CustomerGamesResponse',
      schema: null
    }
  },
  {
    description: 'has response with object type with content type',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
        "200": {
          "description": "Success",
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
                  }
                },
                "required": ["id"]
              }
            }
          }
        }
      }
    },
    expectedOutput: {
      interfaceName: 'GetGamesResponse',
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
          }
        }
      }
    }
  },
  {
    description: 'has response with "default" success code with referenced type with content type',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
        "default": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/definitions/CustomerGamesResponse"
              }
            }
          }
        }
      }
    },
    expectedOutput: {
      interfaceName: 'CustomerGamesResponse',
      schema: null
    }
  },
  {
    description: 'has response with "*/*" content type',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
        "default": {
          "description": "Success",
          "content": {
            "*/*": {
              "schema": {
                "$ref": "#/definitions/CustomerGamesResponse"
              }
            }
          }
        }
      }
    },
    expectedOutput: {
      interfaceName: 'CustomerGamesResponse',
      schema: null
    }
  },
  {
    description: 'has response with "default" success code with referenced type without content type',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
        "default": {
          "description": "Success",
          "schema": {
            "$ref": "#/definitions/CustomerGamesResponse"
          }
        }
      }
    },
    expectedOutput: {
      interfaceName: 'CustomerGamesResponse',
      schema: null
    }
  },
  {
    description: 'has response with empty "content"',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
        "200": {
          "description": "Success",
          "content": {}
        }
      }
    },
    expectedOutput: null
  },
  {
    description: 'has response with no "content"',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
        "200": {
        }
      }
    },
    expectedOutput: null
  },
  {
    description: 'has response with empty "reponses"',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
      }
    },
    expectedOutput: null
  },
  {
    description: 'has response with no "reponses"',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
    },
    expectedOutput: null
  },
  {
    description: 'has empty object for content type',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {}
          }
        }
      }
    },
    expectedOutput: null
  }
];

const failTestData: NegativeTestData[] = [
  {
    description: 'has multiple successful responses',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/definitions/CustomerGamesResponse"
              }
            }
          }
        },
        "201": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/definitions/CustomerGamesResponse2"
              }
            }
          }
        }
      }
    },
    expectedError: ParseMethodResponseErrorEnum.ResponseMustContainExactlyOneSuccessfulResponseCode
  },
  {
    description: 'has default response and 1 more successful response',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
        "default": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/definitions/CustomerGamesResponse"
              }
            }
          }
        },
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/definitions/CustomerGamesResponse2"
              }
            }
          }
        }
      }
    },
    expectedError: ParseMethodResponseErrorEnum.ResponseMustContainExactlyOneSuccessfulResponseCode
  },
  {
    description: 'has content type not other than "application/json"',
    inputMethod: {
      "operationId": "getGames",
      "tags": [
        "Customer"
      ],
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/form-data": {
              "schema": {
                "$ref": "#/definitions/CustomerGamesResponse"
              }
            }
          }
        }
      }
    },
    expectedError: ParseMethodResponseErrorEnum.ResponseCanHaveOnlyJsonContentType
  }
]

describe('Method body response', () => {
  successTestData.forEach(({ description, inputMethod, expectedOutput }) => {
    it(`Parses method that ${description}`, () => {
      expect(parseResponse(inputMethod)).toStrictEqual(expectedOutput);
    });
  });

  failTestData.forEach(({ description, inputMethod, expectedError }) => {
    it(`Throws error for method that ${description}`, () => {
      expect(() => parseResponse(inputMethod)).toThrowError(new AppError(expectedError));
    });
  });
});
