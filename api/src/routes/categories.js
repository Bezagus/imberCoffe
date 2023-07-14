const { Router } = require('express')
const { Categorie } = require('../db.js');
const { encrypted, decrypted, verificationAdmin } = require('./middleware/middleware.js');
const jwt = require('jsonwebtoken');

const app = Router()


app.get('/', async (req, res)=>{
    try{

        let allCategories = await Categorie.findAll()

        if(allCategories.length == 0){
            return res.status(404).send({message: 'no categories'})
        }

        allCategories = allCategories.map(e=>{
            const structure = {
                id: e.id,
                name: e.name,
                img: decrypted(e.img),
            }
            return structure
        })

        return res.status(200).send(allCategories)

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
})

app.get('/id/:id',async (req ,res)=>{
    try{

        const { id } = req.params

        if(!id){
            return res.status(400).send({message:'required data does not exist'})
        }

        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

        if(!uuidRegex.test(id)){
            return res.status(400).send({message: 'id invalid'})
        }

        const verification = await Categorie.findOne({ where:{id:id} })

        if(!verification){
            return res.status(404).send({message:'categorie does not exist'})
        }

        const categorie = {
            id: verification.id,
            img: decrypted(verification.img),
            name: verification.name,
        }

        return res.status(200).send(categorie)

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
})

app.post('/created', verificationAdmin ,async (req, res)=>{
    //try{

        const { name, img } = req.body

        if(!name){
            return res.status(400).send({message:'required data does not exist'})
        }

        const verification = await Categorie.findOne({where: {name: name}})

        if(verification){
            return res.status(404).send({message:'existing categorie'})
        }

        if(!img){

            const newCategorie = { name: name }

            await Categorie.create(newCategorie)

            return res.status(200).send({message:'user created sucessfully'})

        }

        const imgRegex =/^(http[s]?|ftp):\/\/[^\/\.]+?\.[^\/\s]+(\/[^\/\s]*)*$/
            
        if(!imgRegex.test(decrypted(img))){
            return res.status(404).send({message: 'img format invalid'})
        }

        await Categorie.create({
            name: name,
            img: encrypted(img)
        })

        return res.status(200).send({message:'user created sucessfully'})

    /*}catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }*/
})

app.put('/update/:id', verificationAdmin,async (req , res)=>{
    try{

        const {id} = req.params
        const {img, name} = req.query

        if(!id){
            return res.status(400).send({message:'required data does not exist'})
        }
        if(!img && !name){
            return res.status(400).send({message:'required data is missing'})
        }

        const verification = await Categorie.findOne({ where:{id:id} })

        if(!verification){
            return res.status(404).send({message:'categorie does not exist'})
        }

        let imgCategorie = ''

        if(img){
            const imgRegex =/^(http[s]?|ftp):\/\/[^\/\.]+?\.[^\/\s]+(\/[^\/\s]*)*$/
            
            if(imgRegex.test(decrypted(img))){
                imgCategorie = decrypted(img)
            }
        }

        await verification.update({
            img: imgCategorie.length > 0 ? imgCategorie : verification.img,
            name: name ? name : verification.name
        })

        return res.status(200).send({message:'updated information'})

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
})

app.delete('/delete/:id', verificationAdmin,async (req , res)=>{
    try{

        const {id} = req.params

        if(!id){
            return res.status(400).send({message:'required data does not exist'})
        }

        const verification = await Categorie.findOne({ where:{id:id} })

        if(!verification){
            return res.status(404).send({message:'categorie does not exist'})
        }

        await Categorie.destroy({where: {id: id}})

        return res.status(200).send({message: 'successful process'})

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
})




module.exports = app;