// Establishes a connection to the database
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

module.exports = { knex }

