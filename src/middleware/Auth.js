const jwt = require('jsonwebtoken')
const User = require('../models/user')

const Auth = async (req,resp,next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const payload = jwt.verify(token,'HalaMadrid')
        const user = await User.findOne({'id':payload._id , 'tokens.token': token})

        if(!user){
            throw new Error()
        }

        req.user = user
        req.token = token
        next()
    } catch (e){
        resp.status(400).send('Error, login please')
    }
}

module.exports = Auth