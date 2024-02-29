// Establishes a connection to the database
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host : 'localhost',
        port : 3306,
        user : 'root',
        password : '#babNYTaSO!12',
        database : 'exchangerates'
    }
    });

export { knex }

