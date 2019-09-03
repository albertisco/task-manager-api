const express = require('express')
const Task = require('../models/task')
const authMiddleware = require('../middleware/Auth')
const router = express.Router()

router.post('/tasks', authMiddleware ,async (req,resp) => {

    const owner = req.user._id
    const task = new Task({
        ...req.body,
        owner
    })

    try {
        await task.save()
        resp.status(201).send(task)
    } catch (error) {
        resp.status(400).send(error)
    }

})

router.patch('/tasks/:id', authMiddleware, async (req,resp) => {
    
    const id = req.params.id
    const body = req.body

    const updates = Object.keys(body)
    const allowFields = ['description', 'completed']

    const isallowed = updates.every((propertie) => allowFields.includes(propertie))

    if(!isallowed){
        return resp.status(400).send()
    }

    try {
        const taskupdate =  await Task.findOne({_id:id, owner: req.user._id})

        if(!taskupdate) {
            return resp.status(400).send()
        }

        updates.forEach((update) => taskupdate[update] = body[update])
        taskupdate.save()
        resp.send(taskupdate)
        
    } catch (error) {
        resp.status(500).send()
    }

})

router.delete('/tasks/:id', authMiddleware ,async (req,resp) => {
    const id = req.params.id

    try {

        const taskdeleted = await Task.findOneAndDelete({ _id: id , owner:req.user._id})

        if(!taskdeleted) {
            throw new Error()
        }
        resp.status(200).send(taskdeleted)

    } catch (error) {
        resp.status(500).send(error)
    }
})

///tasks?completed=true&limit=1&skip=2&orderBy=field:desc|asc
router.get('/tasks', authMiddleware ,async (req,resp) => {

    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true' 
    }

    if(req.query.orderby){
        const parts = req.query.orderby.split(':')
        console.log(parts)
        sort[parts[0]] = parts[1] === 'desc'? -1:1
    }

    try {
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        resp.send(req.user.tasks)
    } catch (error) {
        resp.status(500).send(error)
    }
})

router.get('/tasks/:id', authMiddleware ,async (req,resp) => {
    const id = req.params.id

    try {
        const task = await Task.findOne({_id:id, 'owner': req.user._id})

        if(!task) {
            return resp.status(404).send()
        }

        resp.send(task)
    } catch(error) {
        resp.status(500).send(error)
    }
    
})

module.exports = router