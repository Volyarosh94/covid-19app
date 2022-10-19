# IPG backend application

## Project set up

-   Install [NodeJS](https://nodejs.org/en/)
-   Install [pgAdmin](https://www.pgadmin.org/) db client for postgres
-   Install install postgres image via docker for local development (optional)
-   Run `npm install` in root folder

further steps to be defined...

## Authentication

Multi factor authentication process is being handled on both IOS and Web apps against microsoft identity platform [https://docs.microsoft.com/en-us/azure/active-directory/develop/](https://docs.microsoft.com/en-us/azure/active-directory/develop/)

Please follow instructions by the link [https://mfa.interpublic.com/](https://mfa.interpublic.com/) and add your phone number or use the Authenticator app to verify.

## Testing

Tests are using `jest`. Most tests are unit-tests and they are running in parallel.

### Running tests

`npm run test`

### Writing tests

-   Each service has it's own folder for tests `__tests__`
-   Tests configurations defined in `package.json` file
-   Test execution in `spec.ts` file.

## Build

`tsc` is used as a build system. Use `dist` folder for output files. Source maps generated as separate file. Debugging configured for Visual Studio Code.

Scripts:

-   `build` - build application
-   `test` - run unit-tests
-   `lint` - run liter
-   `lint:fix` - fix lint issues
-   `precommit` - build ready for deploy

Please use `npm run precommit` command before commit, it used to run build, lint and fix lint issues and run tests. Application runs on [localhost:3000](http://localhost:3000) by default.

Swagger documentation is generated on build [localhost:3000/api/docs](http://localhost:3000/api/docs)

### Branch naming

Please branch out from dev branch before implementing new feature or fix.

-   feature - dev-IPG-myTaskNumber will be merged in **dev**
-   fix - fix-myBranchName will be merged in **dev**

## Migrations

Migrations are required to synchronize changes into database.

To get to know how to work with migrations please read documentation [How migrations work](https://typeorm.io/#/migrations).

Migration scripts:

-   `migration:generate` - automatically generates migration files with schema changes made
-   `migration:create` - creates new migration file
-   `migration:run` - runs migration
-   `migration:revert` - reverts changes

All migrations scripts are located in `package.json` file.

Before running migration ensure you've included your migration file in `migration.config` file.

Ex:

```ts
{
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + "/**/*.entity.ts"],
    synchronize: false,
    cli: {
        migrationsDir: "src/migrations"
    },
    migrations: [InitialtMigration1627904990483]
}

```
