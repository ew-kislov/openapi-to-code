import { ParseMethodSecurityErrorEnum, parseSecurity } from '../../../../src/parser/method/method-security';
import { AppError } from '../../../../src/core';
import { Method } from '../../../../src/openapi-document';
import { ParsedMethodSecurity } from '../../../../src/parser/types';
import { ClientSecurityParams } from '../../../../src/types';

interface PositiveTestData {
  description: string;
  inputMethod: Method;
  inputSecurityParams: ClientSecurityParams | null;
  expectedOutput: ParsedMethodSecurity;
};

interface NegativeTestData {
  description: string;
  inputMethod: Method;
  inputSecurityParams: ClientSecurityParams | null;
  expectedError: ParseMethodSecurityErrorEnum;
};

const successTestData: PositiveTestData[] = [
  {
    description: 'with authorization header and api key',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ],
      "security": [
        {
          "Api-Key": [],
          "Authorization": []
        }
      ]
    },
    inputSecurityParams: {
      apiKeysMapping: { 'Api-Key': 'apiKey' },
      authorizationHeader: 'Authorization'
    },
    expectedOutput: {
      apiKeys: { 'Api-Key': 'apiKey' },
      authRequired: true
    }
  },
  {
    description: 'with authorization header and without api key',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ],
      "security": [
        {
          "Authorization": []
        }
      ]
    },
    inputSecurityParams: {
      apiKeysMapping: { 'Api-Key': 'apiKey' },
      authorizationHeader: 'Authorization'
    },
    expectedOutput: {
      apiKeys: {},
      authRequired: true
    }
  },
  {
    description: 'without authorization header and with api key',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ],
      "security": [
        {
          "Api-Key": []
        }
      ]
    },
    inputSecurityParams: {
      apiKeysMapping: { 'Api-Key': 'apiKey' },
      authorizationHeader: 'Authorization'
    },
    expectedOutput: {
      apiKeys: { 'Api-Key': 'apiKey' },
      authRequired: false
    }
  },
  {
    description: 'without authorization header and without api key',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ],
      "security": [
      ]
    },
    inputSecurityParams: {
      apiKeysMapping: { 'Api-Key': 'apiKey' },
      authorizationHeader: 'Authorization'
    },
    expectedOutput: {
      apiKeys: {},
      authRequired: false
    }
  },
  {
    description: 'with empty "security" property',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ]
    },
    inputSecurityParams: {
      apiKeysMapping: { 'Api-Key': 'apiKey' },
      authorizationHeader: 'Authorization'
    },
    expectedOutput: {
      apiKeys: {},
      authRequired: false
    }
  },
  {
    description: 'with empty "security" property / with empty securityParams.authorizationHeader',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ]
    },
    inputSecurityParams: {
      apiKeysMapping: { 'Api-Key': 'apiKey' }
    },
    expectedOutput: {
      apiKeys: {},
      authRequired: false
    }
  },
  {
    description: 'with empty "security" property / with empty securityParams.apiKeysMapping',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ]
    },
    inputSecurityParams: {
      authorizationHeader: 'Authorization'
    },
    expectedOutput: {
      apiKeys: {},
      authRequired: false
    }
  },
  {
    description: 'with empty "security" property / with empty securityParams',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ]
    },
    inputSecurityParams: {},
    expectedOutput: {
      apiKeys: {},
      authRequired: false
    }
  },
  {
    description: 'with empty "security" property / with securityParams = null',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ]
    },
    inputSecurityParams: null,
    expectedOutput: {
      apiKeys: {},
      authRequired: false
    }
  },
  {
    description: 'with authorization header and without api key',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ],
      "security": [
        {
          "Authorization": []
        }
      ]
    },
    inputSecurityParams: {
      authorizationHeader: 'Authorization'
    },
    expectedOutput: {
      apiKeys: {},
      authRequired: true
    }
  }
];

const failTestData: NegativeTestData[] = [
  {
    description: 'with header in security and with securityParams = null',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ],
      "security": [
        {
          "Authorization": []
        }
      ]
    },
    inputSecurityParams: null,
    expectedError: ParseMethodSecurityErrorEnum.UnknownSecurityHeader
  },
  {
    description: 'with header in security and with empty securityParams',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ],
      "security": [
        {
          "Authorization": []
        }
      ]
    },
    inputSecurityParams: {},
    expectedError: ParseMethodSecurityErrorEnum.UnknownSecurityHeader
  },
  {
    description: 'with header in security and with securityParams.apiKeysMapping not including this header',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ],
      "security": [
        {
          "Authorization": []
        }
      ]
    },
    inputSecurityParams: {
      apiKeysMapping: { 'Api-Key': 'apiKey' }
    },
    expectedError: ParseMethodSecurityErrorEnum.UnknownSecurityHeader
  },
  {
    description: 'with non-auth header in security and with securityParams.authorizationHeader',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ],
      "security": [
        {
          "Api-Key": []
        }
      ]
    },
    inputSecurityParams: {
      authorizationHeader: 'Authorization'
    },
    expectedError: ParseMethodSecurityErrorEnum.UnknownSecurityHeader
  },
  {
    description: 'with non-auth header in security and with securityParams.authorizationHeader',
    inputMethod: {
      "operationId": "updateServicePackage",
      "tags": [
        "Customers"
      ],
      "security": [
        {
          "Authorization": []
        }
      ]
    },
    inputSecurityParams: {
      apiKeysMapping: { 'Api-Key': 'apiKey' }
    },
    expectedError: ParseMethodSecurityErrorEnum.UnknownSecurityHeader
  }
]

describe('Method method security params', () => {
  successTestData.forEach(({ description, inputMethod, inputSecurityParams, expectedOutput }) => {
    it(`Parses method that ${description}`, () => {
      expect(parseSecurity(inputMethod, inputSecurityParams)).toStrictEqual(expectedOutput);
    });
  });

  failTestData.forEach(({ description, inputMethod, inputSecurityParams, expectedError }) => {
    it(`Throws error for method ${description}`, () => {
      expect(() => parseSecurity(inputMethod, inputSecurityParams)).toThrowError(new AppError(expectedError));
    });
  });
});
