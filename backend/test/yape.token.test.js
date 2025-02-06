const request = require('axios');

const options = {
    method: 'POST',
    url: 'https://secure.culqi.com/v2/tokens/yape',
    headers: {
       Authorization: 'Bearer pk_test_13d300d97397e474',
      'content-type': 'application/json'
    },
    body: {
      otp: '946627',
      number_phone: '951123456',
      amount: '500',
      metadata: {dni: '5831543'}
    },
    json: true
  };
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
  
    console.log(body);
  });