# graphql-codegen-make-export-as-optional

A graphql codegen plugin to set the field of the generated variables interface as optional if the variable is filled in
by the client
with [local-only fields](https://the-guild.dev/graphql/apollo-angular/docs/local-state/managing-state-with-field-policies#using-local-only-fields-as-graphql-variables).

This plugin must be applied directly before the typescript-operations plugin as this plugin modifies the documents that the
typescript-operations receives.

The plugin `@trellisorg/graphql-codegen-restore-export-as-changes` should be added after the typescript-operations
plugin to restore the documents for other plugins such as typed-document-node.

## Example

An example gql query to get the post count of an author using a local state variable of currentAuthorId. In this query
authorId is required by the gql schema, however since it is provided with a local state variable we would rather not
have to set a empty string with the generated angular service.

```gql
query CurrentAuthorPostCount($authorId: Int!) {
    currentAuthorId @client @export(as: "authorId")
    postCount(authorId: $authorId)
  }
```

We have to specify the authorId as empty because it is required in the variables interface.

```ts
myService.watch({ authorId: '' }).valueChanges.pipe()
```

However, with this plugin we can set up the codegen to mark this variable as optional:

```yaml
overwrite: true
schema: 'schema.gql'
generates:
    operations.ts:
        preset: import-types
        documents: '**/*.graphql'
        presetConfig:
            typesPath: './types'
        config:
            documentMode: graphQLTag
        plugins:
            -   add:
                    content: '/* eslint-disable */'
            - '@trellisorg/graphql-codegen-make-export-as-optional'
            - typescript-operations
            - '@trellisorg/graphql-codegen-restore-export-as-changes'
            - typed-document-node
    angular.ts:
        documents: '**/*.graphql'
        config:
            documentMode: external
            importOperationTypesFrom: 'Operations'
            importDocumentNodeExternallyFrom: './operations'
            querySuffix: 'QueryService'
            mutationSuffix: 'MutationService'
            subscriptionSuffix: 'SubscriptionService'
            namedClient: 'bullet'
            addExplicitOverride: true
        plugins:
            - 'typescript-apollo-angular'
```

Now the generated angular variable interface will have `authorId` defined as an optional int instead of a required int
while still having a required `$authorId` in the typed-document-node.

```ts
myService.watch({}).valueChanges.pipe()
```

## Building

Run `nx build graphql-codegen-make-export-as-optional` to build the library.

## Running unit tests

Run `nx test graphql-codegen-make-export-as-optional` to execute the unit tests via [Jest](https://jestjs.io).
