
![alt text](https://typingdna.com/assets/images/typingdna-logo-black.png)

Basic node.js wrapper for the TypingDna API

[![npm](https://img.shields.io/npm/v/typingdnaclient.svg)](https://www.npmjs.com/package/typingdnaclient)

## Installing

```shell
npm install typingdnaclient --save
```

## Instantiate client

```javascript
var TypingDnaClient = require('typingdnaclient');
var typingDnaClient = new TypingDnaClient('apiKey', 'apiSecret');
```

The default TypingDNA API Server is __api.typingdna.com__.
You can use the alternative server __tdna-api.azurewebsites.net__.

```javascript
var typingDnaClient = new TypingDnaClient('apiKey', 'apiSecret','tdna-api.azurewebsites.net');
```


## Usage example

Get the previously saved typing patterns count for a user:

```javascript
typingDnaClient.check(
    { userId : 'userID',
      type: '2',
      device: 'desktop'
    },
    function(error, result) {
      if (error) { console.error(error) }
      console.log(result);
    });
```

## Available Methods

```javascript
typingDnaClient.check(options, callback);
typingDnaClient.save(userId, typingPattern, callback);
typingDnaClient.delete(options, callback);
typingDnaClient.verify(userId, typingPattern, quality, callback);
typingDnaClient.match(typingPattern1, typingPattern2, quality, callback);
typingDnaClient.getQuote(minLength, maxLength, callback);
typingDnaClient.server(serverName);
typingDnaClient.requestTimeout(timeout);
```

## Documentation

__https://api.typingdna.com__

## License

Apache-2.0
