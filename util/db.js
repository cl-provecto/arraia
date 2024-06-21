const { Pool } = require('pg')

const pool = new Pool({
    host: 'aws-0-us-east-1.pooler.supabase.com',
    user: 'postgres.tfajhjjkayrdqlrlxnwl',
    password: 'ERJAzYVszp1anz2b',
    port: 5432,
    database: 'postgres'
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