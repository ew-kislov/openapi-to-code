import { ParseMethodRequestParamsErrorEnum, parseRequestParams } from '../../../../src/parser/method/method-request-params';
import { AppError } from '../../../../src/core';
import { ParsedSchema } from '../../../../src/parser';
import { MethodParameter } from '../../../../src/openapi-document';

describe('Method request "parameters"', () => {
  it('Returns true if parameter has $ref in schema', () => {
    const input: MethodParameter[] = [
      {
        "name": "id",
        "in": "query",
        "type": "integer",
        "required": true
      },
      {
        "name": "accepted",
        "in": "query",
        "type": "boolean",
        "description": "Accepted",
        "required": false
      },
      {
        "name": "reason",
        "in": "query"
      }
    ];

    const expectedOutput: ParsedSchema = {
      inlineType: 'object',
      properties: {
        id: {
          required: true,
          schema: {
            inlineType: 'integer'
          }
        },
        accepted: {
          required: false,
          schema: {
            inlineType: 'boolean'
          }
        },
        reason: {
          required: false,
          schema: {
            inlineType: 'unknown'
          }
        }
      }
    }

    expect(parseRequestParams(input)).toStrictEqual(expectedOutput);
  });

  it('Throws an error if at least one parameter item doesn\'t contain name', () => {
    const input: MethodParameter[] = [
      {
        "name": "id",
        "in": "query",
        "type": "integer",
        "required": true
      },
      {
        "in": "query",
        "type": "boolean",
        "description": "Accepted",
        "required": false
      } as MethodParameter,
      {
        "name": "reason",
        "in": "query"
      }
    ];

    expect(() => parseRequestParams(input))
      .toThrowError(new AppError(ParseMethodRequestParamsErrorEnum.ParameterMustHaveName));
  });
});
