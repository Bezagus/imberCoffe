const { Router } = require('express')
const { JWT_NAME } = process.env
const { encrypted, decrypted } = require('./middleware/middleware.js')
const bcrypt = require('bcrypt')
const {User} = require('../db.js')
const jwt = require('jsonwebtoken')


const app = Router()

app.post('/User', async (req, res)=>{


        const {user, password} = req.body
    
        const userEncrypted = encrypted(user)
        const passwordEncrypted = encrypted(password)
    
        const verificationUser = await User.findAll({ where: { username: userEncrypted }})
    
        if(verificationUser.length == 0){
            return res.status(404).send({message:'user does not exist'})
        }
        const verificationPassword = await bcrypt.compare(password, verificationUser[0].password)
    
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

   
    
    
})

app.post('/Admin', async (req, res)=>{


    const {user, password} = req.body

    const userEncrypted = encrypted(user)
    const passwordEncrypted = encrypted(password)

    const verificationUser = await User.findAll({ where: { username: userEncrypted }})

    if(verificationUser.length == 0){
        return res.status(404).send({message:'user does not exist'})
    }
    const verificationPassword = await bcrypt.compare(password, verificationUser[0].password)

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




})
module.exports = app