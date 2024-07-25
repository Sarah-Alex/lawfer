const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const accountSid = '----'; // Replace with your Twilio Account SID
const authToken = '----'; // Replace with your Twilio Auth Token
const serviceSid = '----'; // Replace with your Twilio Service SID
const client = twilio(accountSid, authToken);


const verifyService = client.verify.v2.services(serviceSid);

app.post('/send-code', (req, res) => {
  const { phoneNumber } = req.body;
  console.log('Request to send verification code to:', phoneNumber); // Log the incoming request

  verifyService.verifications
      .create({ to: phoneNumber, channel: 'sms' })
      .then(verification => {
          console.log('Verification sent:', verification.sid); // Log the verification SID
          res.json({ sid: verification.sid, status: verification.status }); // Return sid and status as JSON
      })
      .catch(err => {
          console.error('Error sending verification code:', err); // Log any errors
          res.status(500).json({ error: err.message || 'An error occurred while sending verification code.' }); // Return error as JSON
      });
});

app.post('/verify-code', (req, res) => {
  const { phoneNumber, code } = req.body;
  verifyService.verificationChecks
    .create({ to: phoneNumber, code: code })
    .then(verification_check => {
      console.log('Verification check result:', verification_check);
      res.json({ status: verification_check.status });  // Return status as JSON
    })
    .catch(err => {
      console.error('Error verifying code:', err);
      res.status(500).json({ error: err.message });  // Return error as JSON
    });
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});


