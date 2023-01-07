# dotnet webapi webapp vue

The service is both an API and app and it generates razor pages as well as serves Vue pages as static content

## Scaffolding

### Create the project

    >dotnet new webapi

### Add packages

    >dotnet add package Microsoft.EntityFrameworkCore.Sqlite --version 7.0.1
    >dotnet add package Microsoft.EntityFrameworkCore.Design --version 7.0.1
    >dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design --version 7.0.1

### Add tools

    >dotnet tool install --global dotnet-aspnet-codegenerator --version 7.0.1

#### If sqlite database already has tables

    >dotnet ef dbcontext scaffold "Data Source=./MyDatabase.sqlite" Microsoft.EntityFrameworkCore.Sqlite -o MyDbContext -c MyTable

### npm scripts (run `npm init -y` if necessary)

    "update-database": "dotnet ef database update",
    "update-controller": "dotnet aspnet-codegenerator controller -name MyDatabaseController -dc vue_dotnet.MyDbContext.MyTableContext -m vue_dotnet.MyDbContext.MyTable -async -api -outDir Controllers -f -sqlite",
    "update-page": "dotnet aspnet-codegenerator razorpage -m vue_dotnet.MyDbContext.MyTable -dc vue_dotnet.MyDbContext.MyTableContext -udl -outDir Pages/MyDatabase --referenceScriptLibraries -sqlite",
    "update-proxy": "npx openapi-typescript http://localhost:5202/swagger/v1/swagger.json --output ./vue-for-webapi/src/ApiProxy.ts --path-params-as-types"

#### Once the dbcontext has been generated

    >npm run update-controller
    >npm run update-page
    >dotnet watch

#### Once the dbcontext has been modified by the developer

    > npm run update-migrations -- "MigrationName"
    > npm run update-database

### Optional way to Create Table

Create a single table, which is assumed above

    >sqlite3 MyDatabase.sqlite  
    CREATE TABLE MyTable (id INTEGER PRIMARY KEY);
    .quit

Import imdb

    >pip install imdb-sqlite
    >imdb-sqlite

## Vue

Vue will deploy into wwwroot
    npm install vue@3

## References

[Razor View](http://localhost:5085/MyDatabase)
[Swagger](http://localhost:5085/swagger/index.html)
[Static Files](http://localhost:5085/index.html)
