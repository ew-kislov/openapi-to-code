import { ParseMethodRequestParamsErrorEnum, parseRequestParam } from '../../../../src/parser/method/method-request-params';
import { AppError } from '../../../../src/core';
import { MethodParameter } from '../../../../src/openapi-document';
import { ParsedSchema } from '../../../../src/parser/types';

interface PositiveTestData {
  description: string;
  input: MethodParameter;
  expectedOutput: ParsedSchema;
};

interface NegativeTestData {
  description: string;
  input: MethodParameter;
  expectedError: string;
};

const positiveTestData: PositiveTestData[] = [
  {
    description: 'has integer type',
    input: {
      "name": "id",
      "in": "path",
      "type": "integer",
      "required": true
    },
    expectedOutput: {
      inlineType: 'integer'
    }
  },
  {
    description: 'has number type',
    input: {
      "name": "id",
      "in": "path",
      "type": "number",
      "required": true
    },
    expectedOutput: {
      inlineType: 'number'
    }
  },
  {
    description: 'has string type',
    input: {
      "name": "id",
      "in": "path",
      "type": "string",
      "required": true
    },
    expectedOutput: {
      inlineType: 'string'
    }
  },
  {
    description: 'has boolean type',
    input: {
      "name": "accepted",
      "in": "query",
      "type": "boolean",
      "description": "Accepted",
      "required": false
    },
    expectedOutput: {
      inlineType: 'boolean'
    }
  },
  {
    description: 'has file type',
    input: {
      "name": "photo",
      "in": "formData",
      "type": "file"
    },
    expectedOutput: {
      inlineType: 'file'
    }
  },
  {
    description: 'has "schema" with "$ref"',
    input: {
      "name": "body",
      "in": "body",
      "required": true,
      "schema": {
        "$ref": "#/definitions/CreateGameRequest"
      }
    },
    expectedOutput: {
      customType: 'CreateGameRequest'
    }
  },
  {
    description: 'has array type and doesn\'t have specified item type',
    input: {
      "name": "typeIds",
      "in": "query",
      "type": "array",
      "required": false
    },
    expectedOutput: {
      inlineType: 'array',
      itemsSchema: {
        inlineType: 'unknown'
      }
    }
  },
  {
    description: 'has array type with integer "items"."type"',
    input: {
      "name": "typeIds",
      "in": "query",
      "type": "array",
      "items": {
        "type": "integer"
      },
      "required": false
    },
    expectedOutput: {
      inlineType: 'array',
      itemsSchema: {
        inlineType: 'integer'
      }
    }
  },
  {
    description: 'has enum type',
    input: {
      "name": "userType",
      "in": "query",
      "type": "string",
      "enum": ["player", "customer"],
      "required": false
    },
    expectedOutput: {
      inlineType: 'enum',
      enum: ['player', 'customer']
    }
  },
  {
    description: 'has array type and with enum "items"."type"',
    input: {
      "name": "userRoles",
      "in": "query",
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["player", "customer"]
      },
      "required": false
    },
    expectedOutput: {
      inlineType: 'array',
      itemsSchema: {
        inlineType: 'enum',
        enum: ['player', 'customer']
      }
    }
  },
  {
    description: 'has string "type" in "schema"',
    input: {
      "name": "reason",
      "required": true,
      "in": "query",
      "schema": {
        "type": "string"
      }
    },
    expectedOutput: {
      inlineType: 'string'
    }
  },
  {
    description: 'has number "type" in "schema"',
    input: {
      "name": "id",
      "required": true,
      "in": "query",
      "schema": {
        "type": "number"
      }
    },
    expectedOutput: {
      inlineType: 'number'
    }
  },
  {
    description: 'has integer "type" in "schema"',
    input: {
      "name": "id",
      "required": true,
      "in": "query",
      "schema": {
        "type": "integer"
      }
    },
    expectedOutput: {
      inlineType: 'integer'
    }
  },
  {
    description: 'has boolean "type" in "schema"',
    input: {
      "name": "verified",
      "required": true,
      "in": "query",
      "schema": {
        "type": "boolean"
      }
    },
    expectedOutput: {
      inlineType: 'boolean'
    }
  },
  {
    description: 'has "enum" in "schema"',
    input: {
      "name": "role",
      "required": true,
      "in": "query",
      "schema": {
        "type": "string",
        "enum": ["player", "customer"]
      }
    },
    expectedOutput: {
      inlineType: 'enum',
      enum: ['player', 'customer']
    }
  },
  {
    description: 'doesn\'t have "type" in "schema"',
    input: {
      "name": "prop"
    } as MethodParameter,
    expectedOutput: {
      inlineType: 'unknown'
    }
  },
  {
    description: 'has array "type" in "schema"',
    input: {
      "name": "role",
      "required": true,
      "in": "query",
      "schema": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["player", "customer"]
        }
      }
    },
    expectedOutput: {
      inlineType: 'array',
      itemsSchema: {
        inlineType: 'enum',
        enum: ['player', 'customer']
      }
    }
  },
  {
    description: 'has array "type" in "schema"',
    input: {
      "name": "role",
      "required": true,
      "in": "query",
      "schema": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["player", "customer"]
        }
      }
    },
    expectedOutput: {
      inlineType: 'array',
      itemsSchema: {
        inlineType: 'enum',
        enum: ['player', 'customer']
      }
    }
  },
  {
    description: 'has object "type" in "schema"',
    input: {
      "name": "role",
      "required": true,
      "in": "query",
      "schema": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "photo": {
            "type": "file"
          },
          "role": {
            "$ref": "#/components/schemas/UserRole"
          }
        },
        required: ["name", "role"]
      }
    },
    expectedOutput: {
      inlineType: 'object',
      properties: {
        name: {
          required: true,
          schema: {
            inlineType: 'string'
          }
        },
        photo: {
          required: false,
          schema: {
            inlineType: 'file'
          }
        },
        role: {
          required: true,
          schema: {
            customType: 'UserRole'
          }
        }
      }
    }
  }
];

const failTestData: NegativeTestData[] = [
  {
    description: 'doesn\'t have "name"',
    input: {
      "required": true,
      "in": "query",
      "type": "integer",
      "schema": {
        "type": "integer"
      }
    } as MethodParameter,
    expectedError: ParseMethodRequestParamsErrorEnum.ParameterCantHaveBothTypeAndSchema
  },
  {
    description: 'has object "type"',
    input: {
      "required": true,
      "in": "query",
      "type": "object",
    } as unknown as MethodParameter,
    expectedError: ParseMethodRequestParamsErrorEnum.UnsupportedTypeInParameter
  },
  {
    description: 'has array "type" with file items',
    input: {
      "required": true,
      "in": "query",
      "type": "array",
      "items": {
        type: "object"
      }
    } as MethodParameter,
    expectedError: ParseMethodRequestParamsErrorEnum.ArrayCanContainOnlyPrimitives
  }
]

describe('Method request "parameters" item', () => {
  positiveTestData.forEach(({ description, input, expectedOutput }) => {
    it(`Parses method request "parameters" item that ${description}`, () => {
      expect(parseRequestParam(input)).toStrictEqual(expectedOutput);
    });
  });

  failTestData.forEach(({ description, input, expectedError }) => {
    it(`Throws error for request "parameters" item that ${description}`, () => {
      expect(() => parseRequestParam(input)).toThrowError(new AppError(expectedError));
    });
  });
});
