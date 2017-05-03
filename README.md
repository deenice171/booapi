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
    "email": "lucas@something.com",
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
Connection String: `//const connectionString = process.env.DB_CONN || 'mongodb://localhost/bookAPI';`

Option Object:

```
let options = { 
  dbType: 'mongo', 
  dbName: 'bookAPI', 
  user: '',
  password: '',
  host: 'localhost',
  port: 27017,
  connectionString:connectionString 
};
```

### Postgres
Connection String: `const connectionString = process.env.DB_CONN || 'postgres://user:password@localhost:5432/name-of-database';
`

Option Object:

```
let options = {
  dbType: 'postgres',
  dbName: process.env.dbName,
  user: process.env.dbUser,
  password: process.env.dbPassword,
  host: 'localhost',
  port: 5432,
  connectionString: connectionString
};
```
## Default Endpoints

The API comes with the basic default REST endpoint for each of the model that corresponds to the database tables

Method: `GET`
Endpoint: `http://localhost:3000/api/v1/<model>`
Response:

```
[
  {
    "id": 1,
    "clientId": 214,
    "createdAt": "2014-01-10T00:00:00.000Z",
    "updatedAt": "2014-01-10T00:00:00.000Z",
  },
  {
    "id": 2,
    "clientId": 64,
    "createdAt": "2013-12-31T00:00:00.000Z",
    "updatedAt": "2013-12-31T00:00:00.000Z"
  }]
```
Method: `GET`
Endpoint: `http://localhost:3000/api/v1/<model>/id/2`
Response:

```
{
    "id": 2,
    "clientId": 64,
    "createdAt": "2013-12-31T00:00:00.000Z",
    "updatedAt": "2013-12-31T00:00:00.000Z"
}
```

Method: `DELETE`
Endpoint: `http://localhost:3000/api/v1/<model>/id/2`

Method: `POST`
Endpoint: `http://localhost:3000/api/v1/<model>`
Request:
```
{
    "clientId": 64,
    "createdAt": "2013-12-31T00:00:00.000Z",
    "updatedAt": "2013-12-31T00:00:00.000Z"
  }
```
Response:
```
{
    "id": 4,
    "clientId": 64,
    "createdAt": "2013-12-31T00:00:00.000Z",
    "updatedAt": "2013-12-31T00:00:00.000Z"
  }
```
Method: `PUT`
Endpoint: `http://localhost:3000/api/v1/<model>/id/2`
Request:
```
{
    "clientId": 64,
    "createdAt": "2013-12-31T00:00:00.000Z",
    "updatedAt": "2013-12-31T00:00:00.000Z"
  }
Response:
```
{
    "id": 2,
    "clientId": 64,
    "createdAt": "2013-12-31T00:00:00.000Z",
    "updatedAt": "2013-12-31T00:00:00.000Z"
  }
```

## Flexable Endpoints

There are two flexible endpoints to update and select anything the user specify within the request payload. For example, a request object:

```
{   
    "serialNumber":123,
    "updatedAt":"2017-04-24",
    "where":{
        "isActive":0,
        "id":731
    }
}
```

will produce and execute the sql command 

```UPDATE "Tank" as _tank SET "serialNumber"=123,"updatedAt"='2017-04-24' WHERE "_tank"."isActive"=0 AND "_tank"."id"=731 RETURNING id 
```

Method: `POST`
Endpoint: `http://localhost:3000/api/v1/<model>/update`
Request:
```
{   
    "serialNumber":123,
    "updatedAt":"2017-04-24",
    "where":{
        "isActive":0,
        "id":731
    }
}
```
Response:
```
{
  "message": "update success",
  "data": [
    {
      "id": 731,
      "serialNumber": "123",
      "deletedAt": null,
      "createdAt": "2016-11-04T00:00:00.000Z",
      "updatedAt": "2017-04-24T07:00:00.000Z",
    }
  ]
}
```

The second flexible endpoints retrieve any data the user specify within the request object. For example, a request payload of:

```
{
  "get": ["*"],
  "left_outer_join": [{
        "DeliveryOrder": "tankId",
        "on": "id",
        "as": "deliveryOrders",
        "left_inner_join":{
        	"Product":"id",
        	"on":"productId",
        	"as":"product"
        }
    },{
        "WorkOrder": "clientId",
        "on": "clientId",
        "as": "tankType"
    }
  ],
  "where": {
    "isActive": 1,
    "id": 815
  },
  "group": [
  		"id"
  	],
  "sort": {
    "id": "ASC",
    "clientId": "DESC"
  }
 }
```

will produce and execute the following sql command

```
SELECT "_tank".*, json_agg("_deliveryorder".*) AS "DeliveryOrder" , json_agg("_workorder".*) AS "WorkOrder" FROM "Tank" as "_tank" LEFT OUTER JOIN "DeliveryOrder" as "_deliveryorder" ON ("_deliveryorder"."tankId"="_tank"."id") LEFT OUTER JOIN "WorkOrder" as "_workorder" ON("_workorder"."clientId"="_tank"."clientId") WHERE "_tank"."isActive"=1 AND "_tank"."id"=815 GROUP BY "_tank"."id" ORDER BY "_tank"."id" ASC, "_tank"."clientId" DESC
```

This endpoint supports get * or a comma separated string that corresponds to the property within the select clause.

### Joins
Supports `Inner Join`, `Outer Join`, `Left Outer Join`, `Full Join`
Supports all the major joins, including nested joins

Besides the "get" property, all other property is optional

Method: `POST`
Endpoint: `http://localhost:3000/api/v1/<model>/get`
Request:
```
{
  "get": ["*"],
  "left_outer_join": [{
        "DeliveryOrder": "tankId",
        "on": "id",
        "as": "deliveryOrders",
        "left_inner_join":{
        	"Product":"id",
        	"on":"productId",
        	"as":"product"
        }
    },{
        "WorkOrder": "clientId",
        "on": "clientId",
        "as": "tankType"
    }
  ],
  "where": {
    "isActive": 1,
    "id": 815
  },
  "group": [
  		"id"
  	],
  "sort": {
    "id": "ASC",
    "clientId": "DESC"
  }
 }
```
Response:
```
...a large object
```

## Custom Endpoints

It is common that a custom endpoint is desired during development. That is why the API supports custom endpoints. To create a custom endpoint, call the extend of the baseRouter from your model file.

### Example:

`this.model.router.extend('/read', 'GET', this.getRead);`

The above will wire a new API route at `http://localhost:3000/api/v1/<model>/read` as a "GET" request with a callback containing the req, res, next parameter.

```
 getRead = (req: Request, res: Response, next: NextFunction) => {
        this.model.find({ read: true }, (err: any, resp: any) => {
            if (!err) {
                res.json(resp);
            } else {
                res.status(500).send(err);
            }
        });
    }
```

