[![Build Status](https://travis-ci.org/Ipsumaite/IpsumAPI.svg?branch=oceano)](https://travis-ci.org/Ipsumaite/IpsumAPI)

# IpsumAPI

Ipsum Project Backend API


## environment variables
```
SFuser - Salesforce User
SFpassword - Salesforce password
SFtoken - Salesforce Token
apiport - API local port, it will accept host port
apikey - API key
apitokenttl - Token time to live (s)
loggerhost - papertrail host
loggerport - papertrail port
```


### Create User
Use signup method (POST)

```
email: "email"
password: "password"
user: {"firstname":" "First Name", "lastname":"Last Name", "phone":"Phone Number", "address":"Address"}
```


### Methods
Unsecured Methods
/ping - Tests if the server is alive
/login - Requests user authentication
/signup - Creates Account

Secured Methods
/api/SFping - Tests if the Salesforce Connectivity is established


