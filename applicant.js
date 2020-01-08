const bookshelf = require('./database')

module.exports = bookshelf.Model.extend({
    tableName: 'applicants'
})
