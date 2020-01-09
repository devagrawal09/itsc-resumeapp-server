const bookshelf = require('./database')
const bcrypt = require('bcrypt')

const Manager = bookshelf.Model.extend({
  tableName: 'managers'
}, {
  login: async ({ username, password }) => {
    const manager = await new Manager({ username }).fetch()
    const valid = await bcrypt.compare(password, manager.get('password'))
    if( !valid )
      throw new Error('Invalid password!')
    return manager
  }
})

const createSampleManager = async ()=> {
  const count = await Manager.count()
  console.log(`Manager count: ${count}`)
  if( count == 0 ) {
    const username = process.env.MANAGER_USERNAME
    const password = await bcrypt.hash(process.env.MANAGER_PASSWORD, 10)
    const manager = new Manager({ username, password })
    const doc = await manager.save()
    console.log(`Created manager ${doc.get('username')}`)
  }
}

createSampleManager()

module.exports = Manager
