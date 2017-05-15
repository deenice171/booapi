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

## Setup
To setup the api, using mongo, specify the mongo connection string and options object. See Options below

For Postgres, configure database settings in .env, then build your models. This will automatically the database if it does not exist and create the tables matching the model specifications.

OR connect to an existing database with the postgres connection string and options object. See below.

You will still need to build your models ie. create a someModel.ts file within the models directory and export it in the index.ts file.

For example, if you want to create a new model and its corresponding table in the database called "Car", create a file named Car.ts, specify the schema then export the Car class in index.ts file. 

If the "Car" table already exists, then the API will do nothing, (it will not create a new "Car" table) on startup

`git clone https://github.com/Endtry/TSExpressAPI.git`
`npm install`
`gulp scripts`
`npm start`

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

Method: `POST`
Endpoint: `'/find-by-email'`
Request:
```
{
	"email":"lucas@shift3tech.com"
}
```
Response: 
```
{
  "id": 1,
  "email": "lucas@shift3tech.com",
  "username": "lucas",
  "password": "$2a$10$7/mqbffuQE4tm/arx0ud4eqG7diKWiq7K.//UXRr5VfC5Ji1nerhS",
  "role": "admin,driver",
  "superAdmin": true,
  "isActivated": false,
  "createdAt": "2017-05-03T07:00:00.000Z",
  "updatedAt": "2017-05-03T07:00:00.000Z",
  "deletedAt": null
}
```
Method:`POST`
Endpoint: `'/create-secure'`
Request:
```
{
	"email":"lucass11s1s@shift3tech.com",
	"password":"abc123",
	"username":"lucas",
	"role":["admin", "driver"],
	"superAdmin":true
}
```
Response:
```
{
  "id": 7,
  "email": "lucass11s1s@shift3tech.com",
  "username": "lucas",
  "password": "$2a$10$dw1lO5nOTCMRZR4XUN0ekul5KQsy8mp5HTQRPMkInrRepA8dbspXG",
  "role": "admin,driver",
  "superAdmin": true,
  "isActivated": false,
  "createdAt": "2017-05-03T07:00:00.000Z",
  "updatedAt": "2017-05-03T07:00:00.000Z",
  "deletedAt": null
}
```
## Authorization

Once authenticated, the user will get a hashed token. On every API request thereafter, authorization header must be set. Eg.

Authorization: 'Bearer xxxxxx' where xxxxxx is the token received from the login success response.

## Options

The API currently supports MongoDB and Postgres. The database configuration is in the .env file and is read in bu the index.ts file.

### Mongo
Connection String: `//const connectionString = process.env.DB_CONN || 'mongodb://localhost/bookAPI';`

Option Object:

```
let options = { 
  dbType: 'mongo', 
  dbName: 'bookAPI', 
  dbUser: '',
  dbPassword: '',
  dbHost: 'localhost',
  dbPort: 27017,
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
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASS,
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
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
```
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

```
UPDATE "Tank" as _tank SET "serialNumber"=123,"updatedAt"='2017-04-24' WHERE "_tank"."isActive"=0 AND "_tank"."id"=731 RETURNING id 
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
	"get":["*"],
	"join":[
		{
			"table":"BookUser",
			"joinType":"left outer join",
			"as":"bookUsers",
			"on":[
					{"BookUser":"user_id", "User":"id"} // supports multiple conditions
				],
			"where":{
				"active":true
			},
			"include":false, // do join but exclude results from returned object
			"join":{
				"table":"Book",
				"joinType":"full join",
				"as":"books",
				"get":["*"], // support "*" or comma separated values. If "get" is not specified, then "*"
				"on":[
					{"Book":"id", "BookUser":"book_id"},
					{"User":"id", "BookUser":"user_id"}
				],
				"where":{
					"active":true
				}
			}
		},
		{
			"table":"Tank",
			"joinType":"inner join",
			"as":"tanks",
			"get":["*"],
			"on":[
				{"User":"id", "Tank":"user_id"}
			],
			"where":{
				"active":true
			}
		}
	],
	"where":{
		"active":true,
		"id":1
	},
	"group":[
		"id"
	],
	"sort":{
		"id":"ASC"
	}, 
  "limit":1
}
```

will produce and execute the following sql command:

```
SELECT "_user".*, 
	json_agg(DISTINCT "_book".*) AS "books", 
  json_agg(DISTINCT "_tank".*) AS "tanks" 
FROM "User" as "_user" 
	left outer join "BookUser" as "_bookuser" ON ("_bookuser"."user_id"="_user"."id" ) 
  	full join "Book" as "_book" ON ("_book"."id"="_bookuser"."book_id" AND "_user"."id"="_bookuser"."user_id" ) 
	inner join "Tank" as "_tank" ON ("_user"."id"="_tank"."user_id" ) 
WHERE "_user"."active"=true 
AND "_user"."id"=1 
AND "_bookuser"."active"=true 
AND "_book"."active"=true 
AND "_tank"."active"=true 
GROUP BY "_user"."id" 
ORDER BY "_user"."id" ASC
LIMIT 1;
```

This endpoint supports get * or a comma separated string that corresponds to the property within the select clause.

### Joins
Supports all joins types ie. `Inner Join`, `Outer Join`, `Left Outer Join`, `Full Join`

Besides the "get" property, all other property is optional

Method: `POST`
Endpoint: `http://localhost:3000/api/v1/<model>/get`
Request:
```
{
	"get":["*"],
	"join":[
		{
			"table":"BookUser",
			"joinType":"left outer join",
			"as":"bookUsers",
			"on":[
					{"BookUser":"user_id", "User":"id"}
				],
			"where":{
				"active":true
			},
			"include":false,
			"join":{
				"table":"Book",
				"joinType":"full join",
				"as":"books",
				"get":["*"],
				"on":[
					{"Book":"id", "BookUser":"book_id"},
					{"User":"id", "BookUser":"user_id"}
				],
				"where":{
					"active":true
				}
			}
		},
		{
			"table":"Tank",
			"joinType":"inner join",
	
			"as":"tanks",
			"get":["*"],
			"on":[
				{"User":"id", "Tank":"user_id"}
			],
			"where":{
				"active":true
			}
		}
	],
	"where":{
		"active":true,
		"id":1
	},
	"group":[
		"id"
	],
	"sort":{
		"id":"ASC"
	},
	"limit":1
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

