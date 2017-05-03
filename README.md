## This Repo

This application is an express/node api written in typescript. The API currently supports option parameters for MongoDB and Postgres. The API will look in the models directory and index.ts file for all the models. If the corresponding table does not exist in the database, it will create it according to the schema provided. for example:

```
{ 
            id: { type: Number, key: 'primary' },
            title: { type: String, maxlength: 24 },
            author: { type: String, maxlength: 24 },
            genre: { type: String, maxlength: 24 },
            read: { type: Boolean, default: true },
            noteId: { 
                type: Number, 
                key: 'foreign', 
                references: { table: 'Note', foreignKey: 'id' },
                onDelete:'cascade',
                onUpdate:'cascade' 
            },
            createdAt: { type: Date },
            updatedAt: { type: Date },
            deletedAt: { type: Date }
        }
```

will generate and execute

```
create table 
	"Book"(
  	"id" serial PRIMARY KEY,
    "title" varchar(24),
    "author" varchar(24),
    "genre" varchar(24),
    "read" boolean default true,
    "noteId" integer references "Note"("id") on delete cascade on update cascade,
    "createdAt" timestamp,"updatedAt" 
    timestamp,"deletedAt" timestamp
  )
```

The API uses express-jwt, jwt and bcrypt to lock down all the endpoints. When a user is authenticated, they are given a encryption key to access the the api data. 

## User Model

By default, the API has a default User Model that has two basic controller methods and endpoint: 

Method: `GET` 
Endpoint: `'user/id/:id/super'`


Method: `POST`
Endpoint: `'user/login'`
Request:
```
{
	"email":"lucas@abc.com",
	"password":"abc123"
}
```
Response:
```
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21tYW5kIjoiU0VMRUNUIiwicm93Q291bnQiOjEsIm9pZCI6bnVsbCwicm93cyI6W3siaWQiOjQsImVtYWlsIjoiTGlzYUBzcGVjaWFsdHlzYWxlc2xsYy5jb20iLCJwYXNzd29yZCI6IiQyYSQxMCQ3ZjdDLlBCUFpySGMzajZ6aXlGUGRPdnh1TnJaalZBbWlXZmUzRllTNXUyOUNxSUV0ZGNNUyIsImVtcGxveWVlSWQiOjMsImRlbGV0ZWRBdCI6bnVsbCwiY3JlYXRlZEF0IjoiMjAxNy0wMi0wNVQwMDowMDowMC4wMDBaIiwidXBkYXRlZEF0IjoiMjAxNy0wMi0wNVQwMDowMDowMC4wMDBaIiwiaXNBY3RpdmUiOnRydWUsImlzQWN0aXZhdGVkIjp0cnVlLCJyb2xlIjpudWxsfV0sImZpZWxkcyI6W3sibmFtZSI6ImlkIiwidGFibGVJRCI6MTgzNzMsImNvbHVtbklEIjoxLCJkYXRhVHlwZUlEIjoyMywiZGF0YVR5cGVTaXplIjo0LCJkYXRhVHlwZU1vZGlmaWVyIjotMSwiZm9ybWF0IjoidGV4dCJ9LHsibmFtZSI6ImVtYWlsIiwidGFibGVJRCI6MTgzNzMsImNvbHVtbklEIjoyLCJkYXRhVHlwZUlEIjoxMDQzLCJkYXRhVHlwZVNpemUiOi0xLCJkYXRhVHlwZU1vZGlmaWVyIjoyNTksImZvcm1hdCI6InRleHQifSx7Im5hbWUiOiJwYXNzd29yZCIsInRhYmxlSUQiOjE4MzczLCJjb2x1bW5JRCI6MywiZGF0YVR5cGVJRCI6MTA0MywiZGF0YVR5cGVTaXplIjotMSwiZGF0YVR5cGVNb2RpZmllciI6MjU5LCJmb3JtYXQiOiJ0ZXh0In0seyJuYW1lIjoiZW1wbG95ZWVJZCIsInRhYmxlSUQiOjE4MzczLCJjb2x1bW5JRCI6NCwiZGF0YVR5cGVJRCI6MjMsImRhdGFUeXBlU2l6ZSI6NCwiZGF0YVR5cGVNb2RpZmllciI6LTEsImZvcm1hdCI6InRleHQifSx7Im5hbWUiOiJkZWxldGVkQXQiLCJ0YWJsZUlEIjoxODM3MywiY29sdW1uSUQiOjUsImRhdGFUeXBlSUQiOjExODQsImRhdGFUeXBlU2l6ZSI6OCwiZGF0YVR5cGVNb2RpZmllciI6LTEsImZvcm1hdCI6InRleHQifSx7Im5hbWUiOiJjcmVhdGVkQXQiLCJ0YWJsZUlEIjoxODM3MywiY29sdW1uSUQiOjYsImRhdGFUeXBlSUQiOjExODQsImRhdGFUeXBlU2l6ZSI6OCwiZGF0YVR5cGVNb2RpZmllciI6LTEsImZvcm1hdCI6InRleHQifSx7Im5hbWUiOiJ1cGRhdGVkQXQiLCJ0YWJsZUlEIjoxODM3MywiY29sdW1uSUQiOjcsImRhdGFUeXBlSUQiOjExODQsImRhdGFUeXBlU2l6ZSI6OCwiZGF0YVR5cGVNb2RpZmllciI6LTEsImZvcm1hdCI6InRleHQifSx7Im5hbWUiOiJpc0FjdGl2ZSIsInRhYmxlSUQiOjE4MzczLCJjb2x1bW5JRCI6OCwiZGF0YVR5cGVJRCI6MTYsImRhdGFUeXBlU2l6ZSI6MSwiZGF0YVR5cGVNb2RpZmllciI6LTEsImZvcm1hdCI6InRleHQifSx7Im5hbWUiOiJpc0FjdGl2YXRlZCIsInRhYmxlSUQiOjE4MzczLCJjb2x1bW5JRCI6OSwiZGF0YVR5cGVJRCI6MTYsImRhdGFUeXBlU2l6ZSI6MSwiZGF0YVR5cGVNb2RpZmllciI6LTEsImZvcm1hdCI6InRleHQifSx7Im5hbWUiOiJyb2xlIiwidGFibGVJRCI6MTgzNzMsImNvbHVtbklEIjoxMCwiZGF0YVR5cGVJRCI6MTA0MywiZGF0YVR5cGVTaXplIjotMSwiZGF0YVR5cGVNb2RpZmllciI6MzQsImZvcm1hdCI6InRleHQifV0sIl9wYXJzZXJzIjpbbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbF0sInJvd0FzQXJyYXkiOmZhbHNlLCJpYXQiOjE0OTM3NzMxMjF9.BnIKa79Efhu2wqT1Iv6hWqWfqIXzIOk2SRvWwpPmnZw",
  "user": {
    "id": 4,
    "email": "Lisa@specialtysalesllc.com",
    "password": "$2a$10$7f7C.PBPZrHc3j6ziyFPdOvxuNrZjVAmiWfe3FYS5u29CqIEtdcMS",
    "employeeId": 3,
    "deletedAt": null,
    "createdAt": "2017-02-05T00:00:00.000Z",
    "updatedAt": "2017-02-05T00:00:00.000Z",
    "isActive": true,
    "isActivated": true,
    "role": null
  }
}
```
## Options

The API currently supports MongoDB and Postgres. The database configuration is in the .env file and is read in bu the index.ts file.

### Mongo


### Postgres
Connection String: `const connectionString = process.env.DB_CONN || 'postgres://user:password@localhost:5432/name-of-database';
`

Option Object:

```
let options = {
  dbType: 'postgres',
  dbName: 'name-of-databases',
  user: 'username',
  password: 'password',
  host: 'localhost',
  port: 5432,
  connectionString: connectionString
};
```
## Default Endpoints


## Flexable Endpoints


1. someUser@ubuntu> export TZ="America/Los_Angeles"
2. someUser@ubuntu> set | grep TZ

## Custom Endpoints

