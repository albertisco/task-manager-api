const moongose = require('mongoose')

const taskSchema = new moongose.Schema({
    description: {
        type: String,
        trim:true,
        required:true
    },
    completed: {
        type:Boolean,
        default: false
    },
    owner:{
        type: moongose.Schema.Types.ObjectId,
        required:true,
        ref:'users'
    }
}, {
    timestamps:true
})

const Task = moongose.model('tasks', taskSchema)

module.exports = Task