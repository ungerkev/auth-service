import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import * as http from 'http';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import {AllowedHeadersMiddleware} from './middlewares/allowedHeaders.middleware';
import { Container } from 'typedi';


config(); // load data from .env
import {appPort, nodeEnv, sessionSecret} from './configs/app.conf';
import { DatabaseLoader } from './loaders/database.loader';


/**
 * Initialization
 */
const app: Application = express();
const server = http.createServer(app);
const database = Container.get(DatabaseLoader);
const allowHeadersMiddleware = Container.get(AllowedHeadersMiddleware);
const routes = require('./routes/index');

/**
 * Interface for session
 */
declare module 'express-session' {
    /* tslint:disable-next-line */
    export interface Session {
        firstName: string;
        uuid: string;
        accessToken: string;
    }
}

/**
 * Application Usages
 */
app.use(allowHeadersMiddleware.checkHeaders); // Global middleware
app.use(cookieParser()); // Get cookies vom request
app.use(session({ // Use sessions
    name: 'user_session',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: undefined, // Destroy cookie when browser is closed
        httpOnly: true,
        secure: (nodeEnv !== 'development'),
    },
}));
app.use(helmet()); // Restrict some headers - security
app.use(cors({ origin: true, credentials: true })); // Cross origin resource
app.use(express.urlencoded({ extended: true })); // To get the body
app.use(express.json()); // Recognize incoming request as a json
app.use('/', routes); // Use the defined routes in index.ts


/**
 * CONNECT DB and START SERVER
 */

database.connect().then(() => {
    server.listen(appPort, () => {
        console.log('Info: Server listening on: http://localhost:' + appPort);
    });
}).catch((error) => {
    console.log('Error: Could not connect to DB - ' + error.toString());
    process.exit(2);
});

