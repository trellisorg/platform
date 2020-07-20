# nx-realm

For building and deploying MongoDB Realm apps

# Generating an app

`yarn nx g @trellisorg/nx-realm:app`

It will ask you some basic questions to fill in the root `config.json`. You may need to enter in some other depending on your setup.

# Building

Same as with any other Nx app
`yarn nx build <project name>`

You can then deploy using the Realm CLI until this package supports deploying.
