import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "chaitanyadharpale2000@gmail.com",
        pass: "pztvuiwzqbdlzred",
    },
    debug: true,
    logger: true
});

// Verify transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.log('Transporter verification error:', error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

async function sendMail(receiver, subject, text="", html="") {
   try{
 const info = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: receiver,
        subject,
        text,
        html,
    });
    console.log(`email is ${process.env.MAIL_USER}`)
    console.log(`email pass is ${process.env.MAIL_PASS}`)

     console.log('Message sent: %s', info.messageId);

    return true;
   }catch(e){
    console.error('Error sending email:', e);
        throw e;
   }
}

export {sendMail};

/*
nodemail with aws deployment.
researching about other smtp service which can be made available 

*/