import { ParameterIn, Type } from '../../../../src/openapi-document';
import { isRequestParamRef } from '../../../../src/parser/method/method-request-params';

describe('isRequestParamRef', () => {
  it('Returns true if parameter has $ref in schema', () => {
    const input = {
      "name": "body",
      "schema": {
        "$ref": "#/components/schemas/UserRole"
      },
      "in": "body" as ParameterIn,
    }

    expect(isRequestParamRef(input)).toBeTruthy;
  });

  it('Returns false if parameter doesn\'t have $ref in schema', () => {
    const input = {
      "name": "body",
      "in": "body" as ParameterIn,
      "schema": {
        "type": "object" as Type
      }
    }

    expect(isRequestParamRef(input)).toBeFalsy;
  });
});
