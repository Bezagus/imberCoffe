const { Router } = require('express')
const { UserAdmin, User } = require('../db.js');
const bcrypt = require('bcrypt');
const { encrypted, decrypted, transporter, verificationAdmin, messageEmail } = require('./middleware/middleware.js');
const { EMAIL_ADMIN } = process.env

const app = Router()

// function users Admins

app.get('/', verificationAdmin ,async (req,res)=>{
    try{

        let allUsers = await UserAdmin.findAll();

        if(allUsers.length == 0){
            return res.status(404).send({message: 'no users founds'})
        }

        allUsers = allUsers.map(e=>{
            
            const structure ={
                id: e.id,
                name: decrypted(e.name),
                username: decrypted(e.username),
                email: decrypted(e.email),
            }

            return structure

        })

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
});

app.get('/id/:id', verificationAdmin ,async (req, res)=>{

    try{

        const { id } = req.params

        if(!id){
            return res.status(400).send({message:'required data does not exist'})
        }

        const user = await UserAdmin.findOne( {where: {id:id}} )

        if(!user){
            return res.status(404).send({message:'user does not exist'})
        }

        const userStructure = {
            id: user.id,
            name: decrypted(user.name),
            username: decrypted(user.username),
            email: decrypted(user.email)
        }

        return res.status(200).send(userStructure)

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }

});

app.post('/created/admin', async (req, res)=>{

    try{

        const { name, username, password, email } = req.body

        if( !name || !username || !password || !email ){
            return res.status(400).send({message:'required data is missing'})
        }

        const encrypteUserName = encrypted(username)
        const encrypteEmail = encrypted(email)
        const passwordHash = await bcrypt.hash(password, 10)
    
        const decryptedEmail = decrypted(email)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const decryptedPassword = decrypted(password)
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()\-=_+[\]{}|\\:',.?/`~]{8,}$/;
    
        if(!emailRegex.test(decryptedEmail)){
            return res.status(400).send({message: 'incorrect email'})
        }
        if(!passwordRegex.test(decryptedPassword)){
            return res.status(400).send({message: 'incorrect password'})
        }

        const verification = await UserAdmin.findOne({ where: {
            username:encrypteUserName,
            email:encrypteEmail 
        }})
    
        if(verification){
            return res.status(404).send({message:'existing user'})
        }

        const emailMessage =  messageEmail(`http://localhost:3001/verify/?u=${decrypted(name)}&un=${decrypted(username)}&p=${passwordHash}}&m=${decryptedEmail}`)

        await transporter.sendMail({
            from: '"Imber Coffe" <imbercoffe@gmail.com>', // sender address
            to: EMAIL_ADMIN, // list of receivers
            subject: "Imber Coffe", // Subject line
            html: emailMessage 
        });

        return res.status(200).send({message: ''})

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }

});

app.post('/created/admin/verify', verificationAdmin ,async (req, res)=>{
    try{

        const { name, username, password, email } = req.body

        if( !name || !username || !password || !email ){
            return res.status(400).send({message:'required data is missing'})
        }

        const encrypteUserName = encrypted(username)
        const encrypteEmail = encrypted(email)
        const passwordHash = await bcrypt.hash(password, 10)
    
        const decryptedEmail = decrypted(email)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const decryptedPassword = decrypted(password)
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()\-=_+[\]{}|\\:',.?/`~]{8,}$/;
    
        if(!emailRegex.test(decryptedEmail)){
            return res.status(400).send({message: 'incorrect email'})
        }
        if(!passwordRegex.test(decryptedPassword)){
            return res.status(400).send({message: 'incorrect password'})
        }

        const verification = await UserAdmin.findOne({ where: {
            username:encrypteUserName,
            email:encrypteEmail 
        }})
    
        if(verification){
            return res.status(404).send({message:'existing user'})
        }

        const newUser = {
            name: encrypted(name),
            username: encrypteUserName,
            password:encrypteEmail,
            emial: encrypteEmail
        }

        await UserAdmin.created(newUser)

        res.status(200).send({ message: 'user created sucessfully'})


    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
})

app.put('/update/info/:id', verificationAdmin ,async (req, res)=>{
    try{
        const { id } = req.params
        const { name, username, email} = req.query
    
        if(!id){
            return res.status(400).send({message: 'no required data found'})
        }

        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

        if(!uuidRegex.test(id)){
            return res.status(400).send({message: 'id invalid'})
        }

        if(!name && !username && !email){
            return res.status(400).send({message: 'no information to update'})
        }
    
        const verificationUser = await UserAdmin.findOne({where:{id:id}})
    
    
        if(verificationUser){
    
            let encrypteName = ''
            let encrypteUserName = ''
            let encrypteEmail = ''
    
            if(name){
                encrypteName = encrypted(name)
            }
            if(username){
                encrypteUserName = encrypted(username)
            }
            if(email){
                encrypteEmail = encrypted(email)
    
                const decryptedEmail = decrypted(email)
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
                if(!emailRegex.test(decryptedEmail)){
                    return res.status(400).send({message: 'incorrect email'})
                }
            }
    
            await verificationUser.update({
                name: name? encrypteName : verificationUser.name,
                username: username? encrypteUserName: verificationUser.username,
                email: email? encrypteEmail: verificationUser.email
            })
            return res.status(200).send({message:'updated information'})
        }
        return res.status(404).send({message:'user does not exist'})

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
})

app.put('/update/img/:id', verificationAdmin ,async (req, res)=>{
    try{

        const { id } = req.params
        const { img } = req.query

        const imgRegex = /^(http[s]?|ftp):\/\/[^\/\.]+?\.[^\/\s]+(\/[^\/\s]*)*$/

        if(!imgRegex.test(decrypted(img))){
            return res.status.send({message: 'image format error'})
        }

        const verificationUser = await UserAdmin.findOne({ where: {id:id}})

        if(!verificationUser){
            return res.status(404).send({message:'user does not exist'})
        }

        await verificationUser.update({
            img: encrypted(img)
        })

        return res.status(200).send({message: 'update image'})

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
})

app.delete('/delete/user/:id', verificationAdmin, async (req, res)=>{
    try{

        const { id } = req.params

        if(!id){
            return res.status(400).send({message: 'no required data found'})
        }

        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

        if(!uuidRegex.test(id)){
            return res.status(400).send({message: 'id invalid'})
        }

        const verificationUser = await UserAdmin.findOne( {where: {id:id}} )

        if(!verificationUser){
            return res.status(404).send({message: 'user does not exist'})
        }

        await User.destroy({where: {id: id}})

        return res.status(200).send({message: 'successful process'})

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
})

//functions users basics

app.get('/userBasic', verificationAdmin, async (req, res)=>{
    try{
        let allUsers = await User.findAll()
        
        if(allUsers.length == 0){
            return res.status(404).send({message: 'no users founds'})
        }

        allUsers = allUsers.map(e=>{
            
            const structure ={
                id: e.id,
                name: decrypted(e.name),
                username: decrypted(e.username),
                email: decrypted(e.email),
                phone: decrypted(e.phone)
            }

            return structure

        })

        return res.status(200).send(allUsers)

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
});

app.get('/userBasic/id/:id', verificationAdmin, async (req,res)=>{

    try{
        const {id} = req.params

        if(!id){
            return res.status(400).send({message:'required data does not exist'})
        }

        const user = await User.findOne({where:{id: id}})

        if(!user){
            return res.status(404).send({message:'user does not exist'})
        }

        const userRequested = {
            id: user.id,
            name: decrypted(user.name),
            username: decrypted(user.username),
            email: decrypted(user.email),
            phone: decrypted(user.phone),
        }

        return res.status(200).send(userRequested)
        
    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
});

app.put('/userBasic/id/:id', verificationAdmin, async (req,res)=>{

    try{
        const {id} = req.params

        if(!id){
            return res.status(400).send({message:'required data does not exist'})
        }

        const user = await User.findOne({where:{id: id}})

        if(!user){
            return res.status(404).send({message:'user does not exist'})
        }

        await user.update({
            block: true
        })

        return res.status(200).send({message: 'successful process'})
        
    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
});

//products

module.exports = app;