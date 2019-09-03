const moongose = require('mongoose')


const url = process.env.dburl
moongose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
        .then( (result) => console.log('conectado'))
        .catch( (error) => console.error('error conect db'))



