const knex = require('knex')({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8'
    }
})
const bookshelf = require('bookshelf')(knex)

knex.schema.createTableIfNotExists('applicants', function(table) {
    table.increments()
    table.string('firstName')
    table.string('lastName')
    table.string('email')
    table.string('position')
    table.boolean('deleted')
    table.timestamps()
}).then(()=> {
    console.log('Applicants table created')
})

knex.schema.createTableIfNotExists('managers', function(table) {
    table.increments()
    table.string('username')
    table.string('password')
    table.timestamps()
}).then(()=> {
    console.log('Managers table created')
})

module.exports = bookshelf