# Cases that are parsed by generator

Constraints:
1. Response body is always JSON.  
2. No headers(except of security headers), cookies are considered.  
3. Only JSON and FormData body types will be parsed.  
4. Method must have either query or body, not both.  
5. On type definitions, only 'type', 'enum', 'required' properties are parsed.  
6. Nested params are parsed only 'requestBody' section(see "Request params".3).  
7. Only "paths", "definitions" global sections are parsed.  

## Request params

1. Explicit parameter

"parameters": [
    {
        "name": "id",
        "in": "path" | "formData" | "query",
        "type": "number"
    }
]

2. Parameter as schema(application/json body only)

"parameters": [
    {
        "name": "body",
        "in": "body",
        "required": true | false,
        "schema": {
            "$ref": "#/definitions/CreateGameRequest"
        }
    },
    ...
]

3. Request body

"requestBody": {
    "required": true,
    "content": {
        "multipart/form-data" | "application/json": {
            "schema": {
                "type": "object",
                "properties": {
                    ...
                },
                "required": [
                    ...
                ]
            }
        }
    }
}

4. Request body with ref

"requestBody": {
    "required": true,
    "content": {
        "multipart/form-data" | "application/json": {
            "schema": {
                "$ref": "..."
            }
        }
    }
}

## Responses

*Only 1 successful response must be specified.*
*Error responses will not be parsed.*

1. Reference to schema

"responses": {
    "200": {
        "description": "Success",
        "schema": {
            "$ref": "#/definitions/SuccessResponse"
        }
    }
}

2. Explicitely defined schema

"responses": {
    "200": {
        "description": "Success",
        "schema": {
            "type": "object",
            "properties": {
                ...
            }
        }
    }
}

*Only 1 content must be specified.*

"responses": {
    "200": {
        "content" {
            "application/json": {
                "description": "Success",
                "schema": {
                   <one of 2 cases above>
                }
            }
        }
    }
}

## Schemas/parameters

This is expected to have in:
- "schema" section  
- "parameters" section  
- "requestBody" section  
- "response" section  


1. Plain type

"id": {
    "type": "number" | "integer" | "string" | "boolean" | "date" | "file"(only for request parameter in FormData)
}

2. Enum

"someEnum": {
    "type": "string",
    "enum": [
        "option_1",
        "option_2",
        "option_3"
    ]
}

3. Array of plain types

"prizeNames": {
    "type": "array",
    "items": {
        "type": "string"
    }
}

4. Reference to another schema

"city": {
    "$ref": "#/definitions/City"
}

5. Array of other schema type

"games": {
    "type": "array",
    "items": {
        "$ref": "#/definitions/Game"
    }
}

6. Nested type

{
    "type": "object",
    "properties": {
        "success": {
            "type": "boolean",
            "value": true
        }
    }
}

7. Array of nested types

"news": {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "id": {
                "type": "integer"
            }
        }
    }
}

-----------------------

"parameters" can also have part of properties move to "schema" section:

{
    "name": "count",
    "schema": {
        "type": "integer",
        "minimum": 1,
        "maximum": 100,
        "default": 10
    },
    "required": false
}
