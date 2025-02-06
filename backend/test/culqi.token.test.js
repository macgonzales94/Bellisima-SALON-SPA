const request = require('axios');

const options = {
  method: 'POST',
  url: 'https://secure.culqi.com/v2/tokens',
  headers: {
    Authorization: 'Bearer pk_test_13d300d97397e474',
    'content-type': 'application/json'
  },
  body: {
    card_number: '4111111111111111',
    cvv: '123',
    expiration_month: 9,
    expiration_year: '2020',
    email: 'ichard@piedpiper.com',
    metadata: {dni: '5831543'}
  },
  json: true
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});