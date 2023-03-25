import { ParameterIn, Type } from '../../../../src/openapi-document';
import { isRequestParamSchema } from '../../../../src/parser/method/method-request-params';

describe('isRequestParamSchema.test', () => {
  it('Returns true if parameter is object and has properties', () => {
    const input = {
      "name": "body",
      "in": "body" as ParameterIn,
      "schema": {
        "type": "object" as Type,
        "properties": {
          "name": {
            "type": "string" as Type
          }
        }
      }
    }

    expect(isRequestParamSchema(input)).toBeTruthy;
  });

  it('Returns true if parameter is integer', () => {
    const input = {
      "name": "body",
      "in": "body" as ParameterIn,
      "schema": {
        "type": "integer" as Type
      }
    }

    expect(isRequestParamSchema(input)).toBeTruthy;
  });

  it('Returns false if parameter doesn\'t have schema', () => {
    const input = {
      "name": "body",
      "schema": {
        "$ref": "#/components/schemas/UserRole"
      },
      "in": "body" as ParameterIn,
    }

    expect(isRequestParamSchema(input)).toBeFalsy;
  });
});
