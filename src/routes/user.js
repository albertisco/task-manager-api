const User = require('../models/user')
const express = require('express')
const AuthMiddleware = require('../middleware/Auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendDeleteEmail, sendWelcomeEmail} = require('../email/email')

const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error('please upload a image'))
        }

        cb(undefined,true)
    }
})

const router = express.Router()


router.post('/users', async (req,resp) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = user.generateAuthToken()

        resp.status(201).send({
            user,
            token
        })
    } catch (error) {
        resp.status(400).send(error)
    }

})

router.post('/users/login', async (req,resp) => {
    try {
        const user = await User.findByCredential(req.body.email,req.body.password)
        const token = user.generateAuthToken()
        resp.status(200).send({
            user,
            token
        })
    } catch (error) {
        resp.status(400).send()
    }
})

router.post('/users/logout', AuthMiddleware, async (req,resp) => {
    const reqtoken = req.token
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== reqtoken
        })

        await req.user.save()
        resp.send()
    } catch (e) {
        resp.status(500).send()
    }
})

router.post('/users/logoutAll', AuthMiddleware, async (req,resp) => {
    const user = req.user
    try {
        user.tokens = []
        await user.save()
        resp.send()
    } catch(e){
        resp.status(500).send()
    }   

})

router.post('/users/me/avatar', AuthMiddleware ,upload.single('avatar'), async (req,resp) => {
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    resp.send()
}, (error,req,resp,next) => {
    resp.status(400).send(error.message)
})

router.get('/users/me', AuthMiddleware , async (req,resp) => {
    resp.send(req.user)
})

router.get('/users/:id' , async (req,resp) => {
    const id = req.params.id

    try {
        const user = await User.findById(id)

        if(!user) {
            return resp.status(404).send()
        }

        resp.send(user)

    } catch (error) {
        resp.status(500).send(error)
    }
})

router.get('/users/:id/avatar', async (req,resp) => {

    try {
        const user = await User.findById(req.params.id)

        if(!user){
            throw new Error('User does not exist')
        }

        if(!user.avatar){
            throw new Error('Please upload a file')
        }

        resp.set('Content-type', 'image/jpg')

        resp.send(user.avatar)
    } catch (e){
        resp.status(500).send(e.message)
    }
})

router.patch('/users/me', AuthMiddleware ,async (req,resp) => {
    
    const body = req.body

    const updates = Object.keys(body)
    const allowFields = ['name', 'age', 'email', 'password']

    const isallowed = updates.every((propertie) => allowFields.includes(propertie))

    if(!isallowed){
        return resp.status(400).send()
    }

    try {

        updates.forEach((update) => req.user[update] = body[update])

        await req.user.save()
        resp.send(req.user)
    } catch (error) {
        resp.status(500).send(error)
    }
   
})

router.delete('/users/me' ,AuthMiddleware, async (req,resp) => {
    try {

        await req.user.remove()
        sendDeleteEmail(req.user.email,req.user.name)
        resp.status(200).send(req.user)

    } catch (error) {
        resp.status(500).send(error)
    }
})

router.delete('/users/me/avatar', AuthMiddleware, async (req,resp) => {
    req.user.avatar = undefined
    try{
        await req.user.save()
        resp.send()
    } catch(e){
        resp.status(00).send()
    }

})

module.exports = router