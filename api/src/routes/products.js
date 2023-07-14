const { Router } = require('express')
const {Product, Categorie} = require('../db.js');
const { encrypted, decrypted, verificationAdmin } = require('./middleware/middleware.js');

const app = Router()

app.get('/', async (req, res)=>{
    try{

        const allProducts = await Product.findAll({
            order: ["id"],
            include: {
              model: Categorie,
              attributes: [
                "name",
                "img"
              ],
              through: {
                attributes: [],
              },
            },
          });

        if(allProducts.length == 0){
            return res.status(404).send({message: 'no products'})
        }

        const listProductos = allProducts.map(e=>{
            const categories = e.categories.map(y=>{
                return {
                    name: y.name,
                    img: decrypted(y.img)
                }
            })

            const structure = {
                id: e.id,
                name: e.name,
                img: decrypted(e.img),
                description: e.description,
                stock: e.stock,
                categories: categories
            }
            return structure
        })

        return res.status(200).send(listProductos)

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

        const verification = await Product.findOne({ where:{id:id} })

        if(!verification){
            return res.status(404).send({message:'product does not exist'})
        }

        const product = {
            id: verification.id,
            img: decrypted(verification.img),
            name: verification.name,
            description: description,
        }

        return res.status(200).send(verification)

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
})

app.post('/created', verificationAdmin ,async (req, res)=>{
    //try{

        const { name, img, price, description, categorie} = req.body

        if(!name && !price){
            return res.status(400).send({message:'required data does not exist'})
        }

        const verification = await Product.findOne({where: {name: name}})

        if(verification){
            return res.status(404).send({message: 'product exist'})
        }

        if(!img){

            await Product.creted({
                name, 
                price,
                description: description? description : {}
            })

            return res.status(200).send({message:'user created sucessfully'})

        }

        const imgRegex =/^(http[s]?|ftp):\/\/[^\/\.]+?\.[^\/\s]+(\/[^\/\s]*)*$/
            
        if(!imgRegex.test(decrypted(img))){
            return res.status(404).send({message: 'img format invalid'})
        }

        const product = await Product.create({
            name, 
            img: encrypted(img),
            price,
            description: description? description : {}
        })

        if(Array.isArray(categorie)){
            categorie.map(async e=>{

                const categories = await Categorie.findOne({where: {name: e}})
 
                if(categories){

                    product.addCategorie(categories)
                }
                if(!categories){
                    const newCategorie = await Categorie.create({name: e})
        
                    product.addCategorie(newCategorie)
                }
            })
        }

        if(!Array.isArray(categorie)){
            const categories = await Categorie.findOne({where: {name: categorie}})

            if(categories){
                product.addCategorie(categories)
            }
            if(!categories){
                const newCategorie = await Categorie.create({name: categorie})

                product.addCategorie(newCategorie)
            }
        }

        return res.status(200).send({message:'product created sucessfully'})

    //}catch(e){
    //    return res.status(500).send({message: 'unexpected error'})
    //}
})

app.put('/update/:id', verificationAdmin,async (req , res)=>{
    try{

        const {id} = req.params
        const {img, name, description} = req.query

        if(!id){
            return res.status(400).send({message:'required data does not exist'})
        }
        if(!img && !name && !description){
            return res.status(400).send({message:'required data is missing'})
        }

        const verification = await Product.findOne({ where:{id:id} })

        if(!verification){
            return res.status(404).send({message:'product does not exist'})
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
            name: name ? name : verification.name,
            description: description? description : verification.description
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

        const verification = await Product.findOne({ where:{id:id} })

        if(!verification){
            return res.status(404).send({message:'categorie does not exist'})
        }

        await Product.destroy({where: {id: id}})

        return res.status(200).send({message: 'successful process'})

    }catch(e){
        return res.status(500).send({message: 'unexpected error'})
    }
})

module.exports = app;