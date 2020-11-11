// Server implementation

const { error } = require('console');
const express = require('express'),
      request = require('request'),
      bodyParser = require('body-parser'),
      path = require('path');

const  CLIENT = 'AaNponrDq6jygBDh5pf6x_TIpqdLp_06juKN8TQtNrgLPMvvjJ-OQMYaqtaVA_Y6SquR1jW4V52MoUr5',
       SECRET = 'EFgYuGqmJlcL9lYjLUYYJs3kZdz70eUv96KExzZJjUHzCSgdLvPyyV1AnU0U_1kUubXqVIzknBMK-xm4',
       PAYPAL_API_BASE = 'https://api.sandbox.paypal.com';

const app = express();
const PORT = process.env.PORT || 3000;
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }));
  // Set up the payment:
  // 1. Set up a URL to handle requests from the PayPal button
  app.post('/my-api/create-payment/', function(req, res)
  {
    // 2. Call /v1/payments/payment to set up the payment
      request.post(PAYPAL_API_BASE + '/v1/payments/payment', {
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
                total: '65.00',
                currency: 'USD',
                details: {
                  subtotal: '64.00',
                  tax: '0.20',
                  shipping: '0.50',
                  handling_fee: '1.00',
                  shipping_discount: '-1.00',
                  insurance: '0.30'
                }
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
      let paymentID = req.body.paymentID,
          payerID = req.body.payerID;

      let urlOptions = {
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
                total: '65.00',
                currency: 'USD',
                details: {
                  subtotal: '64.00',
                  tax: '0.20',
                  shipping: '0.50',
                  handling_fee: '1.00',
                  shipping_discount: '-1.00',
                  insurance: '0.30'
                }
              }
            }]
          },
          json: true
      };

      let isNegativeTest = req.query.negativeTest;

      if(isNegativeTest === "true") {
        urlOptions.headers = {
          'PayPal-Mock-Response' : JSON.stringify({
            "mock_application_codes" : "INSTRUMENT_DECLINED"
          })
        }
      }
      
      // 3. Call /v1/payments/payment/PAY-XXX/execute to finalize the payment.
      request.post(PAYPAL_API_BASE + '/v1/payments/payment/' + paymentID +
        '/execute', urlOptions, function(err, response) {
          if (err) {
            console.error(err);
            return res.sendStatus(500);
          }

          if(response.body.name && response.body.message)  {
            // the response has error based on the negative test case
            res.json({
              status: 'failure',
              code: response.body.name,
              message: response.body.message,
              detail: response.body.details[0].issue
            });
          } else
            // 4. Return a success response to the client
            res.json(
            {
              status: 'success',
              //NOTE: return the transaction ID instead of the payment ID
              //NOTE: a potential bug in the documentation - https://developer.paypal.com/docs/paypal-plus/germany/integrate/execute-payment/#
              // 'order' element does not come in the API response, instead it is sale
              id: response.body.transactions[0].related_resources[0].sale.id
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
    }).listen(PORT, function()
    {
      console.log(`Server listening at ${PORT}`);
    });