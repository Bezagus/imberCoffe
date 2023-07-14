const { Router } = require("express");
const {User, UserAdmin} = require('../../db.js');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { USER_MAILER, PASSWORS_MAILER, JWT_KEY_ADMIN, JWT_KEY } = process.env;
const jwt = require('jsonwebtoken')

const verification = Router()
const verificationAdmin = Router()

const encrypted =  (arg) =>{
    const encryptedArg = Buffer.from(arg).toString('base64');
    return(encryptedArg)
}

const decrypted = (arg) =>{
    const decryptedArg = Buffer.from(arg, 'base64').toString('utf-8');
    return(decryptedArg)
}

const verificationEndrypted = (arg) => {

}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure:true,
    auth: {
        user: USER_MAILER,
        pass: PASSWORS_MAILER
    },
});

verification.use((req, res, next)=>{

    let token = req.headers['x-access-token'] || req.headers['authorization']

    if(!token){
        return res.status(401).send({message: 'authentication token missing'})
    }

    if(token.startsWith('Bearer ')){
        token = token.slice(7, token.length)
    }

    if(token){
        jwt.verify(token, `${JWT_KEY}`, (error, decoded)=>{

            if(error){
                return res.status(401).json({message: 'authentication token fail'})
            }

            req.decoded = decoded;
            next()
        })
    }

})

verificationAdmin.use((req, res, next)=>{

    let token = req.headers['x-access-token'] || req.headers['authorization']

    if(!token){
        return res.status(401).send({message: 'authentication token missing'})
    }

    if(token.startsWith('Bearer ')){
        token = token.slice(7, token.length)
    }

    if(token){
        jwt.verify(token, `${JWT_KEY_ADMIN}`, (error, decoded)=>{
            if(error){
                return res.status(401).json({message: 'authentication token fail'})
            }

            req.decoded = decoded;
            next()
        })
    }

})





// Nodemailer


const messageEmail = (link) =>{
    return (
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
            <style>
                p, a, h1, h2, h3, h4, h5, h6 {font-family: 'Roboto', sans-serif !important;}
                h1{ font-size: 25px !important;}
                h2{ font-size: 20px !important;}
                h3{ font-size: 16px !important;}
                h4{ font-size: 14px !important;}
                p, a{font-size: 15px !important;}
        
                .claseBoton{
                    width: 30%;
                        background-color: #6C3A02;
                        border: 2px solid #6C3A02;
                        color: #000000; 
                        padding: 16px 32px;
                        text-align: center;
                        text-decoration: none;
                        font-weight: bold;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        transition-duration: 0.4s;
                        cursor: pointer;
                }
                .claseBoton:hover{
                    background-color: #5c1303;
                    color: #ffffff;
                }
                .imag{
                    width: 20px;
                    height: 20px;
                }
                .contA{
                    margin: 0px 5px 0 5px;
                }
                .afooter{
                    color: #ffffff !important; 
                    text-decoration: none;
                    font-size: 13px !important;
                }
            </style>
        </head>
        <body>
            <div style="width: 100%; background-color: #e3e3e3;" >
                <div style="padding: 20px 10px 20px 10px;">
                    <!-- Imagen inicial -->
                    <div style="background-color: #ffffff; width: 100%; text-align: center;">
                        <img src="https://i.ibb.co/VYq7mtf/baner-Email.jpg" alt="Banner Imber Coffe" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <!-- Imagen inicial -->
        
                    <!-- Contenido principal -->
                    <div style="background-color: #ffffff; padding: 20px 15px 5px 15px; width: 100%; text-align: center;">
                        <h1>Bienvenido a Imber Coffe</h1>
                        <p>Descubre Imber Coffee, donde el café de alta calidad y los accesorios excepcionales se unen. Explora nuestras variedades seleccionadas de todo el mundo, cuidadosamente elegidas para brindarte una experiencia única. Nuestro equipo apasionado te brindará asesoramiento personalizado, creando momentos inolvidables. Disfruta del placer del café con Imber Coffee, tu compañero perfecto en cada taza. Visítanos en línea o en nuestra tienda física y sumérgete en el apasionante mundo del café.
                        </p>
         
                        <!-- Gracias -->
                        <p>Verifica tu cuenta para continuar!</p>
        
                        <!-- Botón -->
                        <a class="claseBoton" href=${link} style="color: #ffffff; margin-bottom: 15px;">Verificar</a>
                    </div>
                    <!-- Contenido principal -->
        
                    <!-- Footer -->
                    <div style="background-color: #282828; color: #ffffff; padding: 15px 0px 0px 0px; width: 100%; text-align: center;">
                        <!-- Redes sociales -->
                        <a href="https://www.facebook.com/agusbez" class="contA"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/600px-Facebook_f_logo_%282019%29.svg.png" class="imag" /></a>
                        <a href="https://www.instagram.com/agus_bez/" class="contA"><img src="https://cdn.pixabay.com/photo/2021/06/15/12/17/instagram-6338401_1280.png" class="imag" /></a>
                        <!-- Redes sociales -->
        
                        <h4>Soporte</h4>
                        <p style="font-size: 13px; padding: 0px 20px 0px 20px;">
                            Comunícate con nosotros por los siguientes medios:<br>
                            Correo: <a class="afooter" href="mailto:bezagus@gmail.com">bezagus@gmail.com</a><br>
                            Whatsapp: <a class="afooter" href="https://wa.me/+5492972527279">+54 9 2972-527279</a><br>
                        </p>
                        <p style="background-color: black; padding: 10px 0px 10px 0px; font-size: 12px !important;">
                            © 2023 Agusbez, todos los derechos reservados.
                        </p>
                    </div>
                    <!-- Footer -->
        
        
        
                </div>
            </div>
        </body>
        </html>`
    )
} 

const EmailCreatedAdmin = (link) =>{
    return (
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
            <style>
                p, a, h1, h2, h3, h4, h5, h6 {font-family: 'Roboto', sans-serif !important;}
                h1{ font-size: 25px !important;}
                h2{ font-size: 20px !important;}
                h3{ font-size: 16px !important;}
                h4{ font-size: 14px !important;}
                p, a{font-size: 15px !important;}
        
                .claseBoton{
                    width: 30%;
                        background-color: #6C3A02;
                        border: 2px solid #6C3A02;
                        color: #000000; 
                        padding: 16px 32px;
                        text-align: center;
                        text-decoration: none;
                        font-weight: bold;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        transition-duration: 0.4s;
                        cursor: pointer;
                }
                .claseBoton:hover{
                    background-color: #5c1303;
                    color: #ffffff;
                }
                .imag{
                    width: 20px;
                    height: 20px;
                }
                .contA{
                    margin: 0px 5px 0 5px;
                }
                .afooter{
                    color: #ffffff !important; 
                    text-decoration: none;
                    font-size: 13px !important;
                }
            </style>
        </head>
        <body>
            <div style="width: 100%; background-color: #e3e3e3;" >
                <div style="padding: 20px 10px 20px 10px;">
                    <!-- Imagen inicial -->
                    <div style="background-color: #ffffff; width: 100%; text-align: center;">
                        <img src="https://i.ibb.co/VYq7mtf/baner-Email.jpg" alt="Banner Imber Coffe" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <!-- Imagen inicial -->
        
                    <!-- Contenido principal -->
                    <div style="background-color: #ffffff; padding: 20px 15px 5px 15px; width: 100%; text-align: center;">
                        <h1>Crear Administrador Nuevo</h1>
                        <p>
                            Se solicito la creacion de un nuevo administrador, haz la ferificacion en el siguiente link por cuestiones de seguridad
                        </p>
         
                        <!-- Gracias -->
                        <p>Si Desea Crear el usuario Ingrese al Siguiente Link!</p>
        
                        <!-- Botón -->
                        <a class="claseBoton" href=${link} style="color: #ffffff; margin-bottom: 15px;">Crear Administrador</a>
                    </div>
                    <!-- Contenido principal -->
        
                    <!-- Footer -->
                    <div style="background-color: #282828; color: #ffffff; padding: 15px 0px 0px 0px; width: 100%; text-align: center;">
                        <!-- Redes sociales -->
                        <a href="https://www.facebook.com/agusbez" class="contA"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/600px-Facebook_f_logo_%282019%29.svg.png" class="imag" /></a>
                        <a href="https://www.instagram.com/agus_bez/" class="contA"><img src="https://cdn.pixabay.com/photo/2021/06/15/12/17/instagram-6338401_1280.png" class="imag" /></a>
                        <!-- Redes sociales -->
        
                        <h4>Soporte</h4>
                        <p style="font-size: 13px; padding: 0px 20px 0px 20px;">
                            Comunícate con nosotros por los siguientes medios:<br>
                            Correo: <a class="afooter" href="mailto:bezagus@gmail.com">bezagus@gmail.com</a><br>
                            Whatsapp: <a class="afooter" href="https://wa.me/+5492972527279">+54 9 2972-527279</a><br>
                        </p>
                        <p style="background-color: black; padding: 10px 0px 10px 0px; font-size: 12px !important;">
                            © 2023 Agusbez, todos los derechos reservados.
                        </p>
                    </div>
                    <!-- Footer -->
        
        
        
                </div>
            </div>
        </body>
        </html>`
    )
} 


module.exports = {
    encrypted,
    decrypted,
    transporter,
    verification,
    verificationAdmin,
    messageEmail
}