
// # pantone

var request = require('request')
  , cheerio = require('cheerio')
  , _       = require('underscore')

// Optiman's query url
var url = 'http://www.netfront.fr/Services/rgb2pantone/pantone.htm' // ?r=0&g=0&b=0&rgb=000000'

// default options
var defaults = {
    r   : 0
  , g   : 0
  , b   : 0
  , rgb : ''
}

var proxy = process.env.HTTPS_PROXY
 || process.env.https_proxy
 || process.env.HTTP_PROXY
 || process.env.http_proxy;

// main function with callback
function Pantone(options, callback) {

  var self = this

  self.options  = options
  self.callback = callback
  self.rows     = []

  // check types
  if (typeof self.options !== 'object')
    return callback(new Error('pantone - `options` is not an object'))

  if (typeof self.callback !== 'function')
    throw new Error('pantone - `callback` is not a function')

  // if user passed options.hex convert it to options.rgb
  if ('hex' in self.options) {
    if (typeof self.options.hex === 'string') {
      self.options.rgb = self.options.hex
    }
    delete self.options.hex
  }

  // set defaults
  self.options = _.defaults(self.options, defaults)

  // send request
  if (proxy) {
    request = request.defaults({ proxy: proxy, timeout: 5000 });
  }
  request({ url: url, qs: self.options }, sendRequest(self))

}

function sendRequest(self) {

  return function(err, res, body) {

    if (err) {
      err.message = err.message + '\nPlease visit https://github.com/teelaunch/pms-pantone-color-chart/ to report issues.'
      return self.callback(err)
    }

    var $ = cheerio.load(body)

    if ($('#content table').length === 0)
      return self.callback(new Error('pantone - color match not available for your request'))

    $('#content table tr').each(parseTable(self));

    // remove header row
    self.rows = self.rows.slice(1, self.rows.length)

    self.callback(null, self.rows)

  }

}

function parseTable(self) {

  return function(i,tr) {
    var $   = require('cheerio')
      , $td = $(tr).find('td')
    self.rows.push({
        dist : parseFloat($td.eq(0).text())
      , name : $td.eq(1).text()
      , r    : parseInt($td.eq(2).text(), 10)
      , g    : parseInt($td.eq(3).text(), 10)
      , b    : parseInt($td.eq(4).text(), 10)
      , hex  : $td.eq(5).text().substr(1)
    })
  }

}

function pantone(options, callback) {
  var p = new Pantone(options, callback)
  return p
}

module.exports = pantone
