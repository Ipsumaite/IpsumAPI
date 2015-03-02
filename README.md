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
```
/ping - Tests if the server is alive
/login - Requests user authentication
/signup - Creates Account
```
Secured Methods
```
/api/SFping - Tests if the Salesforce Connectivity is established
/api/readtokens - Decrypts respective user for the token in the authorization header
/api/mychannels - (GET) reads all the channels from a user
Example: /api/mychannels/:email
  channel =[{
             "Active": ...,
             "Description": ...,
             "AccountId": ...,
             "Name": ...,
             "Id": ...,
             "Premium": ...,
             "Visible":...
             }
          ]

/api/mychannels - (POST) stores and updates channels for the indicated users
Example:
body={
   channels=[{
             "Active": ...,
             "Description": ...,
             "AccountId": ...,
             "Name": ...,
             "Id": ...,
             "Premium": ...,
             "Visible":...
              "flag": 1/2/3 (1- New Channel, 2- Delete Channel, 3- Update Channel
             }
          ]
   
}
/api/subscriptions - (GET) Reads all subscriptions
Example: /api/subscriptions/:email
{
    "totalSize": 6,
    "channels": [
        {
            "Name": "Channel 1 1234",
            "Description": "Channel 1 1234",
            "Subscribed": false,
            "Id": "a0924000000G2HAAA0",
            "Premium": false
        },
        {
            "Name": "TV Test",
            "Description": "Testing another Channel",
            "Subscribed": false,
            "Id": "a0924000000G2GLAA0",
            "Premium": true
        },
        {
            "Name": "IpsumForecast",
            "Description": "Forecast",
            "Subscribed": true,
            "Id": "a0924000000F6myAAC",
            "Premium": false,
            "Subscription": {
                "Id": "80024000000DD3YAAW",
                "ContractTerm": 6,
                "ContractNumber": "00000109",
                "CreatedDate": "2015-02-26T09:43:06.000+0000",
                "Description": null,
                "EndDate": "2015-08-25",
                "StartDate": "2015-02-26",
                "Status": "Draft"
            }
        }

/api/subscriptions - (POST) synchronizes all subscriptions
Example:
body=
{
	"email":"joao.brito.ramos@gmail.com",
	"subscriptions":[
		{
			"ChannelId":"a0924000000FeCoAAK",
			"flag":1,
			"ContractTerm":6
		}
	]
}
```


