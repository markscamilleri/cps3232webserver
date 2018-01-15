# cps3232 SSO Webserver
NodeJS app for CPS3232 Assignment

To install this server, make sure you have NodeJS, NPM and MongoDB installed. Then run

    npm install
    npm start

The server will start at port 8443.
The certificates are set for the IP address 192.168.1.12

A database has been provided with a client application already added (the photos web app) as well as a user (username: markscamilleri, password: password). To use this you need to run

    mongorestore mongodump

You can also sign up to create your own user.