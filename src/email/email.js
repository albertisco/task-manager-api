const sendgrid = require('@sendgrid/mail')

sendgrid.setApiKey(process.env.email_api_key)


const sendWelcomeEmail = (to,name) => {
    sendgrid.send({
        to,
        from:'albertoalaber92@gmail.com',
        subject:'Welcome !!',
        text:`Welcome to the app ${name}`
    })
}

const sendDeleteEmail = (to,name) => {
    sendgrid.send({
        to,
        from:'albertoalaber92@gmail.com',
        subject:'Welcome !!',
        text:`Hi, ${name} ¿Why have you choosen delete your account?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendDeleteEmail
}
