// Server implementation

var express = require('express');
var request = require('request');
var path = require('path');

var CLIENT = 'AaNponrDq6jygBDh5pf6x_TIpqdLp_06juKN8TQtNrgLPMvvjJ-OQMYaqtaVA_Y6SquR1jW4V52MoUr5';
var SECRET = 'EFgYuGqmJlcL9lYjLUYYJs3kZdz70eUv96KExzZJjUHzCSgdLvPyyV1AnU0U_1kUubXqVIzknBMK-xm4';
var PAYPAL_API = 'https://api.sandbox.paypal.com';

var app = express();

  // Set up the payment:
  // 1. Set up a URL to handle requests from the PayPal button
  app.post('/my-api/create-payment/', function(req, res)
  {
    // 2. Call /v1/payments/payment to set up the payment
    request.post(PAYPAL_API + '/v1/payments/payment',
    {
      auth:
      {
        user: CLIENT,
        pass: SECRET
      },
      body:
      {
        intent: 'sale',
        payer:
        {
          payment_method: 'paypal'
        },
        transactions: [
        {
          amount:
          {
            total: '0.01',
            currency: 'USD'
          }
        }],
        redirect_urls:
        {
          return_url: 'http://localhost:3000/complete',
          cancel_url: 'http://localhost:3000'
        }
      },
      json: true
    }, function(err, response)
    {
      if (err)
      {
        console.error(err);
        return res.sendStatus(500);
      }
      // 3. Return the payment ID to the client
      res.json(
      {
        id: response.body.id
      });
    });
  })
  // Execute the payment:
  // 1. Set up a URL to handle requests from the PayPal button.
  .post('/my-api/execute-payment/', function(req, res)
  {
    // 2. Get the payment ID and the payer ID from the request body.
    var paymentID = req.query.paymentID;
    var payerID = req.query.payerID;
    // 3. Call /v1/payments/payment/PAY-XXX/execute to finalize the payment.
    request.post(PAYPAL_API + '/v1/payments/payment/' + paymentID +
      '/execute',
      {
        auth:
        {
          user: CLIENT,
          pass: SECRET
        },
        body:
        {
          payer_id: payerID,
          transactions: [
          {
            amount:
            {
              total: '0.01',
              currency: 'USD'
            }
          }]
        },
        json: true
      },
      function(err, response)
      {
        if (err)
        {
          console.error(err);
          return res.sendStatus(500);
        }
        // 4. Return a success response to the client
        res.json(
        {
          status: 'success',
          id: response.body.id
        });
      });
  })
  // Displaying the checkout page at the start
  .get('/', (req,res) => {
    res.sendFile(path.join(__dirname+'/checkout.html'));
  }).get('/complete', (req,res) => {
    res.sendFile(path.join(__dirname+'/complete.html'));
  }).get('/clientcheckout', (req,res) => {
    res.sendFile(path.join(__dirname+'/clientcheckout.html'));
  }).listen(3000, function()
  {
    console.log('Server listening at http://localhost:3000/');
  });
// Run `node ./server.js` in your terminal