# newman-reporter-phpunit
A newman reporter with a PHPUnit like style. It shows all details including the response body when a request is failing.

```
Starting postman collection 'seeding'

FF..FFFFFFF..F..FFFF..........FF..FFF.FFFFFF..FF

Collection 'seeding' finished

27 failures:

Name: Create User
Url: web:8080/users
Response code: 201, reason: Created
Failed assertion: Status code is 200
Reason: expected response to have status code 200 but got 422
Response body:
{ data:
   { id: '59662604-c375-43b7-aa4c-3ebc2efc51b1',
     name: 'Noname' }
```
