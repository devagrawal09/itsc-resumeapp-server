const Router = require('express').Router
const controllers = require('./controllers')

const router = Router()

// api routes

router.route('/applicant').post(controllers.newApplicant)

router.route('/login').post(controllers.loginManager)

router.route('/logout').post(controllers.logoutManager)

router.route('/applicant').get(controllers.fetchApplicants)

router.route('/applicant').delete(controllers.deleteApplicant)

module.exports = router
