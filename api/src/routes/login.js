const { Router } = require('express')
const { JWT_NAME, JWT_KEY_ADMIN } = process.env
const { encrypted, decrypted } = require('./middleware/middleware.js')
const bcrypt = require('bcrypt')
const {User, UserAdmin} = require('../db.js')
const jwt = require('jsonwebtoken')


const app = Router()

app.post('/user', async (req, res)=>{

    try{
        const {user, password} = req.body

        if(!user || !password ){
            return res.status(400).send({message:'required data is missing'})
        }
    
        const userEncrypted = encrypted(user)

        const decryptedEmail = decrypted(user)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let verificationUser = ''
    
        if(emailRegex.test(decryptedEmail)){
            verificationUser = await User.findOne({ where: { email: userEncrypted }})
        }
        if(!emailRegex.test(decryptedEmail)){
            verificationUser = await User.findOne({ where: { username: userEncrypted }})
        }
    
        if(!verificationUser){
            return res.status(404).send({message:'user does not exist'})
        }


        const verificationPassword = await bcrypt.compare(password, verificationUser.password)
    
        const KEY = JWT_NAME
        

        if(verificationPassword){

            const payload = {
                check: true
            }
            const token = jwt.sign(payload, `${KEY}` ,{
                expiresIn: '1d'
            })
             return res.json({ 
                message: 'Successful Authentication',
                token: token
            })
        }
    
        res.status(404).send({message:'Incorrect password'})

    }catch(e){
       return res.status(500).send({message: 'unexpected error'})
    }
   
    
    
})

app.post('/admin', async (req, res)=>{

    try{
        const {user, password} = req.body

        if(!user || !password ){
            return res.status(400).send({message:'required data is missing'})
        }

        const userEncrypted = encrypted(user)

        const decryptedEmail = decrypted(user)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let verificationUser = ''
    
        if(emailRegex.test(decryptedEmail)){
            verificationUser = await UserAdmin.findOne({ where: { email: userEncrypted }})
        }
        if(!emailRegex.test(decryptedEmail)){
            verificationUser = await UserAdmin.findOne({ where: { username: userEncrypted }})
        }

        if(!verificationUser){
            return res.status(404).send({message:'user does not exist'})
        }
        const verificationPassword = await bcrypt.compare(password, verificationUser.password)

        const KEY = JWT_NAME


        if(verificationPassword){

            const payload = {
                check: true
            }
            const token = jwt.sign(payload, `${JWT_KEY_ADMIN}` ,{
                expiresIn: '1d'
            })
             return res.json({ 
                message: 'Successful Authentication',
                token: token
            })
        }

        res.status(404).send({message:'Incorrect password'})
    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }



})
module.exports = app