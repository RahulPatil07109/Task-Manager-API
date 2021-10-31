// Let's install @sendgrid/mail library
const sgMail = require("@sendgrid/mail");

const sgApiKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sgApiKey);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "rahulpatil07109@gmail.com",
    subject: "Thanks for joinig in !",
    text: ` Welcome to the app ${name} , Let us know how things go along with this app .`,
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "rahulpatil07109@gmail.com",
    subject: "Hope we see you soon !",
    text: `Goodbye ${name} , Is there anything we could have done to kept you onboard ? .
    We would love to get your feedback .`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
