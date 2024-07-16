## Libraries Used in Chatbot Backend Project

### Production Dependencies

* **amqplib** (0.10.4) - For interacting with RabbitMQ, a message broker.
* **bcrypt** (5.1.1) - For hashing passwords.
* **body-parser** (1.20.2) - Middleware for parsing incoming request bodies in Express.
* **cors** (2.8.5) - Middleware for enabling Cross-Origin Resource Sharing (CORS) in Express.
* **dotenv** (16.4.5) - Loads environment variables from a .env file into process.env.
* **express** (4.19.2) - Fast, unopinionated, minimalist web framework for Node.js.
* **jsonwebtoken** (9.0.2) - For generating and verifying JSON Web Tokens (JWTs).
* **moment-timezone** (0.5.45) - For handling dates and times with timezone support.
* **nodemailer** (6.9.13) - For sending emails from Node.js applications.
* **pg** (8.12.0) - PostgreSQL client for Node.js.
* **uuid** (10.0.0) - For generating RFC-compliant UUIDs.

### Development Dependencies

* **nodemon** (3.1.3) - Monitors changes in your Node.js application and automatically restarts the server.

## Installation Instructions

To install production dependencies, run the following command in your terminal:

```bash
npm install ^amqplib ^bcrypt ^body-parser ^cors ^dotenv ^express ^jsonwebtoken ^moment-timezone ^nodemailer ^pg ^uuid
```

## Instructions to Start the Project

### Prerequisites
* Node.js (v20 or higher)
* npm (Node Package Manager)
* PostgreSQL

### RabbitMQ Server
* Ensure RabbitMQ server is installed and running locally or on a network-accessible server. Update the connection details (URL, credentials) in your application configuration if necessary.
### Setup
1. Create a `.env` file in the root directory based on `.env.example`.
2. Populate the `.env` file with necessary configurations like database credentials.

### Start the Server
```bash
npm run dev
```