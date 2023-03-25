# openapi-to-code

## Example of usage

```
generateClient({
    pathToOpenApi: 'https://some-domain.com/api-docs/swagger.json',
    clientName: 'SomeClient',
    target: 'typescript-fetch',
    securityParams: {
        apiKeysMapping: { 'Api-Token': 'apiKey' },
        authorizationHeader: 'Authorization'
    }
});
```
