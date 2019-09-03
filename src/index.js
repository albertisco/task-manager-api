const express = require('express')
require('./db/moongose')
const userRouter = require('./routes/user')
const taskRouter = require('./routes/task')


//se inicializa express
const app = express()

//se obtiene el puerto donde estará montado el servidor expresss
const port = process.env.PORT 

//se ejecuta el metodo json de expres para poder obtener los datos que viene dentro del body en una peticion http
app.use(express.json())


//se incluyen las rutas
app.use(userRouter)
app.use(taskRouter)

//se inicializa el servidor
app.listen(port , () => {
console.log('conectado',port)
})

