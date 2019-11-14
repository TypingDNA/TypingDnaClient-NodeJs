/**
 * NodeJs implementation for the TypingDNA.com Auth API.
 *
 * @version 1.0.5
 *
 * @author Stefan Endres
 * @copyright TypingDNA.com, SC TypingDNA SRL
 * @license http://www.apache.org/licenses/LICENSE-2.0
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/*******************************************************
 * Typical usage
 *
 * var TypingDNAClient = require('typingdnaclient');
 * var typingDnaClient = new TypingDNAClient('Your API Key', 'Your API Secret'[, optional : 'TypingDNA API Server']);
 *
 * The default TypingDNA API Server is api.typingdna.com
 *******************************************************/

'use strict';

var qs = require('querystring');
var https = require('https');
var typingDnaServer = 'api.typingdna.com';
var requestTimeout = 30000;

var TypingDNAClient = function(apiKey, apiSecret, apiServer) {
    if(typeof apiKey !== 'string' || typeof apiSecret !== 'string' || apiKey.length === 0 || apiSecret.length === 0) {
        throw(new Error('Invalid API credentials'));
    }
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
        'Authorization': 'Basic ' + new Buffer(this.apiKey+':'+this.apiSecret).toString('base64')
    };
    this.server(apiServer);
};

/**
 * Callback for typingDna requests.
 *
 * @callback requestCallback
 * @param {object} error - Returned if an error ocures during the request.
 * @param {object} result - The result returned by the function.
 */

/**
 * Save method for saving new patterns, for new or existing users
 * Usage: typingDnaClient.save(userId, typingPattern, callback);
 *
 * @param {string} userId - A string of your choice that identifies the user.
 * @param {string} typingPattern - The typing pattern that you want to associate with the userId.
 * @param {requestCallback} callback - The callback that handles the response.
 **/


TypingDNAClient.prototype.save = function(userId, typingPattern, callback) {
    if(typeof userId !== 'string' || userId.replace(/\s/g,'').length < 6) {
        return callback && callback(new Error('Invalid user id.'), null);
    }
    if(typeof typingPattern !== 'string' || typingPattern.length === 0) {
        return callback && callback(new Error('Invalid typing pattern.'), null);
    }

    this.makeRequest({
        path: '/save/' + encodeURIComponent(userId),
        method: 'POST',
        formData: {
            tp: typingPattern
        }
    }, function(error, response) {
        if(error) {
            return callback && callback(error,null);
        }
        callback && callback(error, {
            message: response['message'],
            success: response['success'] || 0,
            statusCode: parseInt(response['status'])
        });
    })
};

/**
 * Check user method for verifying how many previous recordings you have for a user
 * Usage: typingDnaClient.check(userData, callback);
 *
 * @param {object} options - A string of your choice that identifies the user.is 2.
 * @param {string} options.userId - The id of the user that is verified.
 * @param {string|string[]} options.type - The type of the typing pattern. Possible values ['0','1','2']  0 for Type 0 pattern (anytext), 1 for Type 1 pattern (sametext) and 2 for Type 2 pattern (extended).
 * @param {string} options.textId - The id of text.
 * @param {string} options.device - The device on which the typing pattern was recorded. Possible values ['desktop','mobile']
 * @param {requestCallback} callback - The callback that handles the response.
 **/

TypingDNAClient.prototype.check = function(options, callback) {
    if(typeof options !== 'object') {
        return callback && callback(new Error('Invalid options'), null);
    }
    if(!options.userId || options.userId.replace(/\s/g,'') === '') {
        return callback && callback(new Error('Invalid user id.'), null);
    }
    var queryStringParams = [];
    if(options.type) {
        if(!Array.isArray(options.type)) {
            options.type = [options.type];
        }
        options.type.map(function(type) {
            queryStringParams.push('type=' + encodeURIComponent(type));
        })
    }
    if(options.textId) {
        queryStringParams.push('textid=' + encodeURIComponent(options.textId));
    }
    if(options.device) {
        queryStringParams.push('device=' + encodeURIComponent(options.device));
    }
    var queryString = encodeURIComponent(options.userId) +
        (queryStringParams.length > 0 ?  '?' + queryStringParams.join('&') : '');
    var data = {
        path: '/user/' + queryString,
        method: 'GET',
        formData:{}
    };

    this.makeRequest(data, function(error, response) {
        if(error) {
            return callback && callback(error, null);
        }
        callback && callback(error, {
            message: response['message'],
            success: response['success'] || 0,
            count: response['count'],
            mobilecount: response['mobilecount'],
            type: response['type'],
            statusCode: parseInt(response['status'])
        });
    })
};

/**
 * Delete user's typing patterns.
 * Usage: typingDnaClient.delete(userId, typingPattern, callback);
 *
 * @param {object} options - A string of your choice that identifies the user.is 2.
 * @param {string} options.userId - The id of the user that is verified.
 * @param {string|string[]} options.type - The type of the typing pattern. Possible values ['0','1','2'] 0 for Type 0 pattern (anytext), 1 for Type 1 pattern (sametext) and 2 for Type 2 pattern (extended).
 * @param {string} options.textId - The id of text.
 * @param {string} options.device - The device on which the typing pattern was recorded. Possible values ['desktop','mobile']
 * @param {requestCallback} callback - The callback that handles the response.
 **/
TypingDNAClient.prototype.delete = function(options, callback) {
    if(typeof options !== 'object') {
        return callback && callback(new Error('Invalid options'), null);
    }
    if(!options.userId || options.userId.replace(/\s/g,'') === '') {
        return callback && callback(new Error('Invalid user id.'), null);
    }
    var queryStringParams = [];
    if(options.type) {
        if(!Array.isArray(options.type)) {
            options.type = [options.type];
        }
        options.type.map(function(type) {
            queryStringParams.push('type=' + encodeURIComponent(type));
        })
    }
    if(options.textId) {
        queryStringParams.push('textid=' + encodeURIComponent(options.textId));
    }
    if(options.device) {
        queryStringParams.push('device=' + encodeURIComponent(options.device));
    }
    var queryString = encodeURIComponent(options.userId) +
        (queryStringParams.length > 0 ?  '?' + queryStringParams.join('&') : '');
    var data = {
        path: '/user/' + queryString,
        method: 'DELETE'
    };
    this.makeRequest(data, function(error, response) {
        if(error) {
            return callback && callback(error, null);
        }
        callback && callback(error, {
            message: response['message'],
            success: response['success'] || 0,
            result: response['deleted'],
            statusCode: parseInt(response['status'])
        });
    })
};

/**
 * Verify pattern, for existing users
 * Usage: typingDnaClient.verify(userId, typingPattern, quality, callback);
 *
 * @param {string} userId - The id of the user that is verified.
 * @param {string} typingPattern - The typing pattern that you want to associate with the userId.
 * @param {int} quality - A number between 1 and 3. The default is 2.
 * @param {Object} [options] - An object conytaining extra options for this request.
 * @param {Boolean} [options.deviceSimilarityOnly] - If True, the request will only check the device sililarity.
 * @param {requestCallback} callback - The callback that handles the response.
 **/

TypingDNAClient.prototype.verify = function(userId, typingPattern, quality, options, callback) {
    if(typeof userId !== 'string' || userId.replace(/\s/g,'').length < 6) {
        return callback && callback(new Error('Invalid user id.'), null);
    }
    if(typeof typingPattern !== 'string' || typingPattern.length === 0) {
        return callback && callback(new Error('Invalid typing pattern.'), null);
    }
    if(typeof quality !== 'number') {
        quality = 2;
    }
    if(typeof options === 'function') {
        callback = options;
        options = {}
    }

    this.makeRequest({
        path: '/verify/'+ encodeURIComponent(userId),
        method: 'POST',
        formData: {
            tp: typingPattern,
            quality: Math.max(1,Math.min(3,quality)),
            deviceSimilarityOnly: (options && options.deviceSimilarityOnly ? 1 : 0)
        }
    }, function(error, response) {
        if(error) {
            return callback && callback(error, null);
        }
        var resObj = {
            message: response['message'],
            success: response['success'] || 0,
            statusCode: parseInt(response['status'])
        }
        if(response['result'] !== undefined) { resObj['result'] = response['result']; }
        if(response['score'] !== undefined) { resObj['score'] = Math.round(response['score']); }
        if(response['net_score'] !== undefined) { resObj['netScore'] = Math.round(response['net_score']); }
        if(response['device_similarity'] !== undefined) { resObj['deviceSimilarity'] = Math.round(response['device_similarity']); }
        if(response['confidence_interval'] !== undefined) { resObj['confidence'] = Math.round(response['confidence_interval']); }
        if(response['confidence'] !== undefined) { resObj['netConfidence'] = Math.round(response['confidence']); }

        callback && callback(error, resObj);
    })
};

/**
 * Match method allows you to compare any two typing patterns, returns a match score (a percentage between 0 and 100)
 * We recommend using our save and verify methods instead, explained above
 * Usage: typingDnaClient.match(typingPattern1, typingPattern2, quality, callback);
 *
 * @param {string} typingPattern1 - The typing patterns that you want to match, separated by ';'
 * @param {string} typingPattern2 - The typing patterns anainst you want to match, separated by ';'
 * @param {int} quality - A number between 1 and 3. The default is 2.
 * @param {Object} [options] - An object conytaining extra options for this request.
 * @param {Boolean} [options.deviceSimilarityOnly] - If True, the request will only check the device sililarity.
 * @param {requestCallback} callback - The callback that handles the response.
 **/

TypingDNAClient.prototype.match = function(typingPattern1, typingPattern2, quality, options, callback) {
    if(typeof typingPattern1 !== 'string' ||
        typingPattern1.length === 0 ||
        typeof typingPattern2 !== 'string' ||
        typingPattern2.length === 0) {
        return callback && callback(new Error('Invalid typing pattern.'), null);
    }
    if(typeof quality !== 'number') {
        quality = 2;
    }
    if(typeof options === 'function') {
        callback = options;
        options = {}
    }

    this.makeRequest({
        path: '/match',
        method: 'POST',
        formData:{
            tp1:typingPattern1,
            tp2:typingPattern2,
            quality: Math.max(1,Math.min(3,quality)),
            deviceSimilarityOnly: (options && options.deviceSimilarityOnly ? 1 : 0)
        }
    }, function(error, response) {
        if(!error) {
            return callback && callback(error, null);
        }
        var resObj = {
            message: response['message'],
            success: response['success'] || 0,
            statusCode: parseInt(response['status'])
        }
        if(response['result'] !== undefined) { resObj['result'] = response['result']; }
        if(response['score'] !== undefined) { resObj['score'] = Math.round(response['score']); }
        if(response['net_score'] !== undefined) { resObj['netScore'] = Math.round(response['net_score']); }
        if(response['device_similarity'] !== undefined) { resObj['deviceSimilarity'] = Math.round(response['device_similarity']); }
        if(response['confidence_interval'] !== undefined) { resObj['confidence'] = Math.round(response['confidence_interval']); }
        if(response['confidence'] !== undefined) { resObj['netConfidence'] = Math.round(response['confidence']); }

        callback && callback(error, resObj);
    })
};

/**
 * Get a quote with the length between minLength and maxLength.
 * Usage: typingDnaClient.verify(userId, typingPattern, quality, callback);
 *
 * @param {int} minLength - The minimum length of the quote.
 * @param {int} maxLength - The maximum length of the quote.
 * @param {requestCallback} callback - The callback that handles the response.
 **/

TypingDNAClient.prototype.getQuote = function(minLength, maxLength, callback) {
    var data = {
        path: '/quote?min='+minLength+'&max='+maxLength,
        method: 'GET'
    };

    this.makeRequest(data, function(error, response) {
        if(error) {
            return callback && callback(error, null);
        }
        callback && callback(error, {
            message: response['message'],
            success: response['success'] || 0,
            quote: response['quote'],
            author: response['author'],
            statusCode: parseInt(response['status'])
        });
    })
};


/**
 * Get/Set the typingDna API server.
 * Usage: typingDnaClient.server(serverName);
 *
 * @param {string} serverName - The API server ip or name.
 **/

TypingDNAClient.prototype.server = function(serverName) {
    if(typeof serverName === 'string' && serverName.length > 0) {
        typingDnaServer = serverName;
    } else {
        return typingDnaServer;
    }
};

/**
 * Get/Set the typingDna API request timeout.
 * Usage: typingDnaClient.requestTimeout(timeout);
 *
 * @param {int} timeout - The API server ip or name.
 **/

TypingDNAClient.prototype.requestTimeout = function(timeout) {
    if(typeof timeout === 'number') {
        requestTimeout = timeout;
    } else {
        return requestTimeout;
    }
};

TypingDNAClient.prototype.makeRequest = function(data,callback) {
    var formData = qs.stringify(data.formData);
    var headers = Object.assign(
        this.headers,
        {'Content-Length': Buffer.byteLength(formData)});
    var postOptions = {
        host : typingDnaServer,
        port : 443,
        path: data.path,
        method: data.method,
        headers: headers
    };

    var request = https.request(postOptions, function(response) {
        var result = '';
        response.on('data', function(data) {
            result += data;
        });
        response.on('error', function(error) {
            return callback && callback(error, null);
        });
        response.on('end', function() {
            var resultJson;
            try{
                resultJson = JSON.parse(result)
            }catch(e) {
                return callback && callback(new Error('Error parsing response'), null);
            }
            callback && callback(null, resultJson);
        })
    });
    request.on('error', function(error) {
        return callback && callback(error, null);
    });
    request.setTimeout(
        requestTimeout,
        function() {
            request.abort();
        });
    request.write(formData);
    request.end();
};

module.exports = TypingDNAClient;
