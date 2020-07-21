# nx-realm

For building and deploying MongoDB Realm apps

# Generating an app

`yarn nx g @trellisorg/nx-realm:app`

It will ask you some basic questions to fill in the root `config.json`. You may need to enter in some other depending on your setup.

# Building

Same as with any other Nx app
`yarn nx build <project name>`

You can then deploy using the Realm CLI until this package supports deploying.

# Using Realm globals

Realm provides some globals that are available in the environment that TypeScript will not know about.

Typings for the following are included in nx-realm

1. `utils` - https://docs.mongodb.com/realm/functions/utilities/
2. `http` - https://docs.mongodb.com/realm/services/http/
3. `db` -  Access to the MongoDB Database attached to your application
4. `context' - https://docs.mongodb.com/realm/functions/context/

These can be used by declaring at the top of your functions `source.ts` file the following:

```
declare var db: Db;
declare var http: Http;
declare var utils: Utils;
declare var context: Context;
```

Where the types are imported from `@trellisorg/nx-realm`

Note: some of these typings may be incomplete please open a PR or an Issue with missing typings.
