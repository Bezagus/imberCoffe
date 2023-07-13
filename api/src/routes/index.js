const { Router } = require('express');

const userRouter = require('./user.js')
const loginRouter = require('./login.js')
const adminUserRouter = require('./adminUser.js')
const productRouter = require('./products.js')
const categorieRouter = require('./categories.js')

const router = Router();


router.use('/user', userRouter)
router.use('/login', loginRouter)
router.use('/adminUser', adminUserRouter)
router.use('/product', productRouter)
router.use('/categorie',categorieRouter)



module.exports = router;
