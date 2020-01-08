const Crypto = require('crypto')
const util = require('util')
const Applicant = require('./applicant')
const Manager = require('./manager')

const generateRandomString = async (len)=> {
    const asyncFunc = util.promisify(Crypto.randomBytes)
    const buffer = await asyncFunc(len)
    return buffer.toString('hex')
}

exports.newApplicant = async (req, res)=> {
    const data = req.body
    try {
        const applicant = await new Applicant(data).save()
        console.log(`New applicant created: ${applicant.get('firstName')} ${applicant.get('lastName')}`)

        const resume = req.files.resume
        await util.promisify(resume.mv)(`resume-uploads/${applicant.get('id')}.pdf`)

        res.status(200).send()
    } catch(err) {
        console.error(`Error creating new applicant: ${err}`)
        res.status(500).send()
    }
}

exports.loginManager = async (req, res)=> {
    const credentials = req.body.credentials
    try {
        const manager = await Manager.login(credentials)
        const token = await generateRandomString(48)
        await manager.set({ token }).save()
        res.json({ token })
    } catch(err) {
        console.error(`Error logging in: ${err}`)
        res.status(500).send()
    }
}

exports.logoutManager = async (req, res)=> {
    const credentials = req.body.credentials
    try {
        const manager = await new Manager(credentials).fetch()
        const token = manager.get('token')
        if( !token.length ) {
            res.status(401).send('Already logged out!')
        }
        await manager.set({ token: '' }).save()
        res.status(200).send()
    } catch(err) {
        console.error(`Error logging out: ${err}`)
        res.status(500).send()
    }
}

exports.fetchApplicants = async (req, res)=> {
    try {
        const applicantsCollection = await Applicant.fetchAll()
        const undeletedApplicants = applicantsCollection.filter(applicant=> !applicant.get('deleted'))
        const applicants = undeletedApplicants.map(applicant=> applicant.serialize())
        res.json({ applicants })
    } catch(err) {
        console.error(err)
        res.status(500).send()
    }
}

exports.deleteApplicant = async (req, res)=> {
    const selectedIds = req.body.selectedIds
    try {
        const allApplicants = await Applicant.fetchAll()
        const selectedApplicants = allApplicants.filter(applicant=> (selectedIds.includes(applicant.get('id')) && !applicant.get('deleted')))
        const promises = selectedApplicants.map(applicant=> applicant.set({ deleted: true }).save())
        const deleted = await Promise.all(promises)
        console.log(`${deleted.length} applicants deleted`)
        res.status(200).send(`${deleted.length}`)
    } catch(err) {
        console.error(err)
        res.status(500).send()
    }
}
