const { Pool } = require('pg')

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
})

pool.connect((erro, client, release) => {
    if (erro) {
        throw erro
    }
    console.log('Conexão com o Banco de Dados OK!')
    release()
})

global.db = pool

module.exports = pool