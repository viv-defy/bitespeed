# bitespeed

This project is done as an assigment, submitted to [bitespeed](https://www.bitespeed.co/). Here, we build a simple web-server in **TypeScript (on Node.js) + sqlite3** tech stack.

### Problem briefing

Users can have various online identities, i.e mail-ids and phone-numbers. This service solves the problem of maintaing/mapping the an individual/entity across various email-ids/phone-numbers.

For an detailed and technical description, refer to [bitespeed assignment](https://bitespeed.notion.site/Bitespeed-Backend-Task-Identity-Reconciliation-53392ab01fe149fab989422300423199).

### Running the server

Clone the repository the repository using

```
git clone git@github.com:viv-defy/bitespeed.git
cd bitespeed
```

You can build and run the server in any of the following ways

1. Running with Makefile

- Build to install packages and build the project using `make build`
- Run the server using `make run`
- (Optional) In case you want to run the server with a clean db, you can use `make clean` before building and running the server

2. Running with docker

   In case you already have docker installed on your system, you can use the Dockerfile for building and running the image of the server

### User interaction

The user can make `POST` requests to the endpoint `/identify` running on PORT `3000`. The request body has to be in JSON. Eg:

```
{
	"email": "mcfly@hillvalley.edu",
	"phoneNumber": "123456"
}
```
