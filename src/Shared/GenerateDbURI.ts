import * as dotenv from 'dotenv';
dotenv.config();

export function generateDbURI() {
    let dbURI;
    switch (process.env.NODE_ENV) {
        case 'development':
            dbURI = process.env.CLARK_DB_URI_DEV
                .replace(/<DB_PASSWORD>/g, process.env.CLARK_DB_PWD)
                .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
            break;
        case 'production':
            dbURI = process.env.CLARK_DB_URI
                .replace(/<DB_USERNAME>/g, process.env.CLARK_DB_USERNAME)
                .replace(/<DB_PASSWORD>/g, process.env.CLARK_DB_PWD)
                .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
            break;
        case 'test':
            dbURI = process.env.CLARK_DB_URI_TEST;
            break;
        default:
            dbURI = process.env.CLARK_DB_URI_DEV
                .replace(/<DB_USERNAME>/g, process.env.CLARK_DB_USERNAME)
                .replace(/<DB_PASSWORD>/g, process.env.CLARK_DB_PWD)
                .replace(/<DB_NAME>/g, process.env.CLARK_DB_NAME);
            break;
    }
    return dbURI;
}
