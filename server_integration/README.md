# Paypal Button Server Integration

## Description
This is a Server integration implementation of the paypal button. A sample integration where a user buys a book through paypal

## Pre-requisites
- To be run in a browser that has no url block
- The running system needs to have internet access

## Running the code
- Run `localhost:3000` in the browser
- Use the buyer credentials to buy the book - **sreeram.vasudevan-buyer@gmail.com**
- Try a checkout with Paypal

## Testing the negative case scenario - NEW!
In order to test the negative case scenario, for `INSTRUMENT_DECLINED`, check the _Try negative test_ option and make a payment using the Paypal button and Paypal credits. Use a business sandbox account, with Negative testing enabled in the settings.

## Issues encountered
In the `server.js`, the request body is not captured by the execute-payment in `onAuthorize`, so the **paymentID** and **payerID** are being passed as query parameters instead. This could be an issue with the Paypal button API

## Alternate testing for Client Only Integration
Try running `localhost:3000/clientcheckout` instead of copying to the local machine :-)

## Contact Me
Sreeram Vasudevan <sreeram.vasudevan@gmail.com>
