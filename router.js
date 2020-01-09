const Router = require('express').Router
const controllers = require('./controllers')

const router = Router()

// api routes

router.route('/applicant').post(controllers.newApplicant)

router.route('/login').post(controllers.loginManager)

router.route('/applicant')
    .all(controllers.authMiddleware)
    .get(controllers.fetchApplicants)
    .delete(controllers.deleteApplicant)

module.exports = router
