[![Build Status](https://travis-ci.org/Ipsumaite/IpsumAPI.svg)](https://travis-ci.org/Ipsumaite/IpsumAPI)

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
```


### Create User
Use signup method (POST)

```
email: "email"
password: "password"
user: {"firstname":" "First Name", "lastname":"Last Name", "phone":"Phone Number", "address":"Address"}
```
