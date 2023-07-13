const { Router } = require('express')
const { User } = require('../db.js');
const bcrypt = require('bcrypt');
const { encrypted, decrypted, transporter, verification, messageEmail } = require('./middleware/middleware.js');
const jwt = require('jsonwebtoken');
const {JWT_KEY} = process.env


const app = Router()

//GET

app.get('/' ,async (req,res)=>{
    try{
        let allUsers = await User.findAll()
        
        if(allUsers.length == 0){
            return res.status(404).send({message: 'no users founds'})
        }

        return res.status(200).send(allUsers)
    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
});

app.get('/id/:id', verification, async (req,res)=>{

    try{
        const {id} = req.params

        if(!id){
            return res.status(400).send({message:'required data does not exist'})
        }
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

        if(!uuidRegex.test(id)){
            return res.status(400).send({message: 'id invalid'})
        }

        const user = await User.findOne({where:{id: id}})

        if(!user){
            return res.status(404).send({message:'user does not exist'})
        }

        const directionUser = user.direction.length >= 1 ? user.direction.map(y=>{
            return ({
                cp: encrypted(y.cp)   ,
                address: encrypted(y.address),
                number: encrypted(y.number),
                location: encrypted(y.location),
                province: encrypted(y.province),
                country: encrypted(y.country)
            })
        }) : user.direction

        const cards = user.payments.length >= 1 ? user.payments.map(y=>{
            return ({
                id: y.id? y.id : '',
                card: y.card.length > 1 || y.card? [y.card[0], decrypted(y.card[1])] : '',
                holderName: y.holderName.length || y.holderName > 1 ? decrypted(y.holderName) : '',
                cvv: y.cvv ? y.cvv : ''
            })
        }): user.payments

        const userRequested = {
            id: user.id,
            name: decrypted(user.name),
            username: decrypted(user.username),
            img: decrypted(user.img),
            email: decrypted(user.email),
            phone: decrypted(user.phone),
            direction: directionUser,
            payments: cards,
            verified: user.verified
        }

        return res.status(200).send(userRequested)
        
    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
});

app.get('/verify/now', verification, async (req, res)=>{
    const { u } = req.query
    
    if(!u){
        return res.status(400).send({message: 'no required data found'})
    }

    const encrypteEmail = encrypted(u)

    const verificationUser = await User.findOne({ where: {email: encrypteEmail} });

    if(!verificationUser){
        return res.status(404).send({message: 'incorrect verification'})
    }

    const KEY = JWT_KEY

    const payload = {
        check: true
    }
    const token = jwt.sign(payload, `${KEY}` ,{
        expiresIn: '1d'
    })

    const emailMessage =  messageEmail(`http://localhost:3001/verify/?t=${token}&u=${encrypteEmail}`)

    await transporter.sendMail({
        from: '"Imber Coffe" <imbercoffe@gmail.com>', // sender address
        to: decrypted(u), // list of receivers
        subject: "Imber Coffe", // Subject line
        html: emailMessage 
    });

    return res.status(200).send({message: 'verification sent'})

})

//POST

app.post('/create', async (req,res)=>{

    try{
        const { name, username, password, email, phone} = req.body
    
        if(!name || !username || !password || !email || !phone){
            return res.status(400).send({message:'required data is missing'})
        }


        const passwordHash = await bcrypt.hash(password, 10)
        const encryptedName = encrypted(name)
        const encryptedUsername = encrypted(username)
        const encryptedEmail = encrypted(email)
        const encryptedPhone = encrypted(phone)
        
        const decryptedEmail = decrypted(email)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const decryptedPassword = decrypted(password)
        const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
    
        if(!emailRegex.test(decryptedEmail)){
            return res.status(400).send({message: 'incorrect email'})
        }
        if(!passwordRegex.test(decryptedPassword)){
            return res.status(400).send({message: 'password incorrect'})
        }
    
        const verification = await User.findOne({ where: {
            username:encrypted(username),
            email:encrypted(email) 
        }})
    
        if(verification){
            return res.status(404).send({message:'existing user'})
        }

        const KEY = JWT_KEY

        const payload = {
            check: true
        }
        const token = jwt.sign(payload, `${KEY}` ,{
            expiresIn: '1d'
        })
    
        const emailMessage =  messageEmail(`http://localhost:3001/verify/?t=${token}&u=${email}`)

        await transporter.sendMail({
            from: '"Imber Coffe" <imbercoffe@gmail.com>', // sender address
            to: decryptedEmail, // list of receivers
            subject: "Imber Coffe", // Subject line
            html: emailMessage 
        });

        const newUser = {
            name: encryptedName,
            username: encryptedUsername,
            password: passwordHash,
            email: encryptedEmail,
            phone: encryptedPhone
        }
    
        await User.create(newUser) 
        
        return res.status(200).send({message: 'user created sucessfully'})
    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }

});



//UPDATE

app.put('/verify', verification, async (req, res)=>{

    try{
        const { user } = req.query
    
        if(!user){
            return res.status(400).send({message: 'no required data found'})
        }

        const verificationUser = await User.findOne({ where: { email: user} });
    
        if(!verificationUser){
            return res.status(404).send({message: 'incorrect verification'})
        }

        if(verificationUser.verified){
            return res.status(200).send({message: 'user  already registed'})
        }
    
        await verificationUser[0].update({
            verified: true
        })  

        return res.status(200).send({message: 'registered user' })

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
})

app.put('/update/info/:id', verification, async (req, res)=>{

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
    
        const verificationUser = await User.findOne({where:{id:id}})
    
    
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

app.put('/update/direction/:id', verification, async (req, res)=>{

    
        const { id } = req.params
        const { tag, cp, address, number, location, province, country } = req.query
    
        if(!id){
            return res.status(400).send({message: 'no required data found'})
        }

        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

        if(!uuidRegex.test(id)){
            return res.status(400).send({message: 'id invalid'})
        }

        if( !tag || !cp || !address || !number || !location || !province || !country){
            return res.status(400).send({message: 'missing required update information'})
        }
    
        const verificationUser = await User.findOne({where:{id:id}})
    
        if(!verificationUser){
            return res.status(404).send({message: 'user not found'})
        }

        
        const directions = verificationUser.direction

        const verificationTag = directions.map(e=>{
            if(e.tag){
                if(e.tag == encrypted(tag)){
                    return true
                }
            }
        })

        if(verificationTag){
            return res.status(404).send({message: 'existing information'})
        }

        const newDirection = [{
            id: Math.floor(Math.random() * 90000000) + 10000000,
            tag: encrypted(tag),
            cp: encrypted(cp)   ,
            address: encrypted(address),
            number: encrypted(number),
            location: encrypted(location),
            province: encrypted(province),
            country: encrypted(country)
        }]



        await verificationUser.update({
            direction: directions.concat(newDirection)
        })
    
        return res.status(200).send({message: 'updated information'})
    
})

app.put('/update/payments/:id', verification, async (req, res)=>{
    

        const { id } = req.params
        const { card,  holderName, cvv} = req.query
    
        if(!id){
            return res.status(400).send({message: 'no required data found'})
        } 
    
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    
        if(!uuidRegex.test(id)){
            return res.status(400).send({message: 'id invalid'})
        }
        if(!card || !holderName || !cvv ){
            return res.status(400).send({message: 'missing required update information'})
        }

        const verificationUser = await User.findOne({where:{id:id}})
    
        if(!verificationUser){
            return res.status(400).send({message: 'user not found'})
        }

        
        let lastNumbers = decrypted(card);
    
        if(lastNumbers.length !== 18){
            return res.status(422).send({message: 'invalid card'})
        }
    
        if(decrypted(cvv).length > 3){
            return res.status(422).send({message: 'invalid code security'})
        }
    
    
        const paymentsUser = verificationUser.payments
    
        lastNumbers = encrypted(lastNumbers.slice(-4))
    
        const newCard = [{
            id: Math.floor(Math.random() * 90000000) + 10000000,
            card: [await bcrypt.hash(card, 10),encrypted(lastNumbers)],
            holderName: encrypted(holderName),
            cvv: await bcrypt.hash(cvv, 10)
        }]
    
    
        await verificationUser.update({
            payments: paymentsUser.concat(newCard)
        })
        return res.status(200).send({messageEmail: 'updated information'})
    
})

app.put('/update/password/:id', verification, async (req, res)=>{

    try{

        const { id } = req.params
        const { np, vp ,op } = req.query

        if(!id){
            return res.status(400).send({message: 'no required data found'})
        }

        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

        if(!uuidRegex.test(id)){
            return res.status(400).send({message: 'id invalid'})
        }
        if(!np || !op || !vp){
            return res.status(400).send({message: 'missing required update information'})
        }

        const verificationUser = await User.findOne({ where:{ id:id }})

        if(!verificationUser){
            return res.status(404).send({message: 'user not found'})
        }

        const verificationPassword = await bcrypt.compare(verificationUser.password, op)

        if(!verificationPassword){
            return res.status(422).send({message: 'actual password incorrect'})
        }

        const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
        const validationPassword = decrypted(np)
    
        if(!passwordRegex.test(validationPassword)){
            return res.status(400).send({message: 'incorrect password'})
        }

        const newPassword = encrypted(np)
        

        if(newPassword !== encrypted(vp)){
            return res.status(422).send({message: 'passwords do not match'})
        }

        await verificationUser.update({
            password: newPassword
        })

        res.status(200).send({message: 'updated information'})

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }

})

app.put('/reset/password/:id', verification, async (req, res)=>{

    try{
    
        const { id } = req.params
        const { np } = req.query

        if(!id){
            return res.status(400).send({message: 'no required data found'})
        }

        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

        if(!uuidRegex.test(id)){
            return res.status(400).send({message: 'id invalid'})
        }
        if(!np){
            return res.status(400).send({message: 'missing required update information'})
        }

        const verificationUser = await User.findOne({ where:{ id:id }})

        if(!verificationUser){
            return res.status(404).send({message: 'user not found'})
        }

        const decryptedPassword = decrypted(np)
        const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;

        if(!passwordRegex.test(decryptedPassword)){
            return res.status(400).send({message: 'password invalid'})
        }

        const newPassword = encrypted(np)

        await verificationUser.update({
            password: await bcrypt.hash(newPassword, 10)
        })

        res.status(200).send({message: 'updated information'})

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }

})

app.put('/edit/direction/:id', verification, async (req, res)=>{

    try{
        const { id } = req.params
        const { idDirection, tag, cp, address, number, location, province, country } = req.query
    
        if(!id){
            return res.status(400).send({message: 'no required data found'})
        }
        if(!idDirection){
            return res.status(400).send({message: 'no required id direction found'})
        }
        if(!tag && !cp && !address && !number && !location && !province && !country){
            return res.status(400).send({message: 'the required informtion does no exist'})
        }
    
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    
        if(!uuidRegex.test(id)){
            return res.status(400).send({message: 'id invalid'})
        }
    
        const verificationUser = await User.findOne({ where:{ id:id }})
    
        if(!verificationUser){
            return res.status(404).send({message: 'user not found'})
        }
    
        const directionUser = verificationUser.direction.length >= 1 ? verificationUser.direction.map(e=>{
            
            if(e.id == idDirection){
                console.log('entre')
                return{
                    id: Number(idDirection),
                    tag: tag? encrypted(tag): e.tag,
                    cp: cp ? encrypted(cp) : e.cp ,
                    address: address? encrypted(address) : e.address,
                    number: number? encrypted(number) : e.number,
                    location: location? encrypted(location) : e.location,
                    province: province ? encrypted(province) : e.province,
                    country: country? encrypted(country) : e.country
                }
            }
    
            return e
        }) : []
    
        await verificationUser.update({
            direction: directionUser
        })

    
        return res.status(200).send({message: 'action perdormed'})
    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }

})

app.put('/update/img/:id', verification ,async (req, res)=>{
    try{

        const { id } = req.params
        const { img } = req.query

        const imgRegex = /^(http[s]?|ftp):\/\/[^\/\.]+?\.[^\/\s]+(\/[^\/\s]*)*$/

        if(!imgRegex.test(decrypted(img))){
            return res.status.send({message: 'image format error'})
        }

        const verificationUser = await User.findOne({ where: {id:id}})

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

//DELETE

app.delete('/delete/payments/:id', verification, async (req, res)=>{

    try{

        const { id } = req.params
        const { ic } = req.query

        if(!id){
            return res.status(400).send({message: 'no required data found'})
        }
        if(!ic){
            return res.status(400).send({message: 'no required id found'})
        }

        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

        if(!uuidRegex.test(id)){
            return res.status(400).send({message: 'id invalid'})
        }

        const verificationUser = await User.findOne({ where:{ id:id }})

        if(!verificationUser){
            return res.status(404).send({message: 'user not found'})
        }

        const paymentsUser = verificationUser.payments.length >= 1 ? verificationUser.payments.filter(function(e) {
            return e.id != ic;
        }) : []

        if(paymentsUser.length === verificationUser.payments.length){
            return res.status(404).send({message:'invalid information'})
        }

        await verificationUser.update({
            payments: paymentsUser
        })

        res.status(200).send({message: 'delete card'})

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }

})

app.delete('/delete/user/:id', verification, async (req, res)=>{
    try{

        const { id } = req.params
        const { p } = req.query

        if(!id || !p){
            return res.status(400).send({message: 'no required data found'})
        }

        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

        if(!uuidRegex.test(id)){
            return res.status(400).send({message: 'id invalid'})
        }

        const verificationUser = await User.findOne( {where: {id:id}} )

        const verificationPassword = await bcrypt.compare(verificationUser, p)

        if(!verificationPassword){
            return res.status(400).send({message: 'incorrect password'})
        }

        if(!verificationUser){
            return res.status(404).send({message: 'user does not exist'})
        }

        await User.destroy({where: {id: id}})

        return res.status(200).send({message: 'successful process'})

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
})

app.delete('/delete/direction/:id', verification, async (req, res)=>{

    try{

        const { id } = req.params
        const { idirect } = req.query

        if(!id){
            return res.status(400).send({message: 'no required data found'})
        }
        if(!idirect){
            return res.status(400).send({message: 'no required id found'})
        }

        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

        if(!uuidRegex.test(id)){
            return res.status(400).send({message: 'id invalid'})
        }

        const verificationUser = await User.findOne({ where:{ id:id }})

        if(!verificationUser){
            return res.status(404).send({message: 'user not found'})
        }

        const directionUser = verificationUser.direction.length >= 1 ? verificationUser.direction.filter(function(e) {
            return e.id != idirect;
          }) : []

        if(directionUser.length === verificationUser.direction.length){
            return res.status(400).send({message:'invalid information'})
        }

        await verificationUser.update({
            direction: directionUser
        })

        res.status(200).send({message: 'delete direction'})

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }

})

module.exports = app;