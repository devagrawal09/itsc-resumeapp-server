const Crypto = require('crypto')
const util = require('util')
const jwt = require('jsonwebtoken')
const Applicant = require('./applicant')
const Manager = require('./manager')

const SECRET_KEY = process.env.SECRET_KEY

const generateRandomString = async (len)=> {
    const asyncFunc = util.promisify(Crypto.randomBytes)
    const buffer = await asyncFunc(len)
    return buffer.toString('hex')
}

const generateToken = async (payload, key)=> util.promisify(jwt.sign)(payload, key)

const verifyToken = async (token, key)=> util.promisify(jwt.verify)(token, key)

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
        const payload = { role: 'Manager', id: manager.get('id') }
        console.log({ payload })
        const token = await generateToken(payload, SECRET_KEY)
        console.log({ token })
        res.json({ token })
    } catch(err) {
        console.error(`Error logging in: ${err}`)
        res.status(500).send()
    }
}

exports.authMiddleware = async (req, res, next)=> {
    try {
        const authHeader = req.headers.authorization
        console.log({ authHeader })
        if(!authHeader)
            return res.status(403).send()
        const token = authHeader.split(' ').pop()
        const payload = await verifyToken(token, SECRET_KEY)
        console.log({ payload })
        if( payload.role !== 'Manager' )
            return res.status(403).send()
        next()
    } catch(err) {
        console.error(err)
        res.status(403).send()
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
