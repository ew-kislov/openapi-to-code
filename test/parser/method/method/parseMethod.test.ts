import { parseMethod, ParseMethodParams, ParseMethodResult } from '../../../../src/parser/method/method';

interface PositiveTestData {
  description: string;
  input: ParseMethodParams;
  expectedOutput: ParseMethodResult;
};

const successTestData: PositiveTestData[] = [
  {
    description: 'has: GET type / path parameters / primitive query parameters / response with $ref',
    input: {
      methodPath: '/public-scope/games/preview/{id}',
      methodType: 'get',
      methodDefinition: {
        "operationId": "preview",
        "tags": [
          "User Games"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "type": "integer",
            "description": "Game id",
            "required": true
          },
          {
            "name": "passcode",
            "in": "query",
            "type": "string",
            "required": true
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/GamePreviewResponse"
            }
          }
        },
        "security": [
          {
            "Api-Key": []
          }
        ]
      },
      securityParams: { apiKeysMapping: { 'Api-Key': 'apiKey' } },
      documentInterfaces: [
        {
          name: 'GamePreviewResponse',
          schema: {
            inlineType: 'object',
            properties: {
              id: {
                required: true,
                schema: {
                  inlineType: 'integer'
                }
              }
            }
          }
        }
      ]
    },
    expectedOutput: {
      method: {
        methodName: 'preview',
        methodPath: '/public-scope/games/preview/{id}',
        methodType: 'get',
        security: {
          authRequired: false,
          apiKeys: { 'Api-Key': 'apiKey' }
        },
        pathParams: [
          {
            name: 'id',
            type: 'integer'
          }
        ],
        queryParams: 'PreviewQueryParams',
        body: null,
        response: 'GamePreviewResponse'
      },
      extraInterfaces: [
        {
          name: 'PreviewQueryParams',
          schema: {
            inlineType: 'object',
            properties: {
              passcode: {
                required: true,
                schema: {
                  inlineType: 'string'
                }
              }
            }
          }
        }
      ]
    }
  },
  {
    description: 'has: POST type / path parameters / body parameters as a schema / response as a schema',
    input: {
      methodPath: '/customer-scope/games/{id}',
      methodType: 'patch',
      methodDefinition: {
        "operationId": "updateGame",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "type": "integer",
            "description": "Game id",
            "required": true
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  }
                },
                "required": ["name"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "type": "object",
              "properties": {
                "success": {
                  "type": "boolean",
                }
              },
              "required": ["success"]
            }
          }
        },
        "security": [
          {
            "Api-Key": [],
          },
          {
            "Authorization": [],
          }
        ]
      },
      securityParams: { apiKeysMapping: { 'Api-Key': 'apiKey' }, authorizationHeader: 'Authorization' },
      documentInterfaces: [
        {
          name: 'GamePreviewResponse',
          schema: {
            inlineType: 'object',
            properties: {
              id: {
                required: true,
                schema: {
                  inlineType: 'integer'
                }
              }
            }
          }
        }
      ]
    },
    expectedOutput: {
      method: {
        methodName: 'updateGame',
        methodPath: '/customer-scope/games/{id}',
        methodType: 'patch',
        security: {
          authRequired: true,
          apiKeys: { 'Api-Key': 'apiKey' }
        },
        pathParams: [
          {
            name: 'id',
            type: 'integer'
          }
        ],
        queryParams: null,
        body: { interface: 'UpdateGameBodyParams', type: 'json' },
        response: 'UpdateGameResponse'
      },
      extraInterfaces: [
        {
          name: 'UpdateGameBodyParams',
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
          name: 'UpdateGameResponse',
          schema: {
            inlineType: 'object',
            properties: {
              success: {
                required: true,
                schema: {
                  inlineType: 'boolean'
                }
              }
            }
          }
        }
      ]
    }
  }
];

describe('Method', () => {
  successTestData.forEach(({ description, input, expectedOutput }) => {
    it(`Parses method that ${description}`, () => {
      expect(parseMethod(input)).toStrictEqual(expectedOutput);
    });
  });
});
