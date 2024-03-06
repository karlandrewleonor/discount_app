var nodemailer = require('nodemailer');

var smtpConfig = {
	host: 'smtp.gmail.com',
	service: 'gmail',
	port: 465,
	secure: true,
	auth: {
		user: "Lharamaelua@gmail.com",
		pass: "cijxldgdqimsvphh"
	},
	tls: {
		rejectUnauthorized: false
	}
}

var mailer = nodemailer.createTransport(smtpConfig);
module.exports = mailer