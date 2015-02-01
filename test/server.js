
var http = require('http');
var parse = require('url').parse;
var zlib = require('zlib');
var stream = require('stream');
var convert = require('encoding').convert;

module.exports = TestServer;

function TestServer() {
	this.server = http.createServer(this.router);
	this.port = 30001;
	this.hostname = 'localhost';
	this.server.on('error', function(err) {
		console.log(err.stack);
	});
}

TestServer.prototype.start = function(cb) {
	this.server.listen(this.port, this.hostname, cb);
}

TestServer.prototype.stop = function(cb) {
	this.server.close(cb);
}

TestServer.prototype.router = function(req, res) {

	var p = parse(req.url).pathname;

	if (p === '/hello') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		res.end('world');
	}

	if (p === '/plain') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		res.end('text');
	}

	if (p === '/html') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/html');
		res.end('<html></html>');
	}

	if (p === '/json') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({
			name: 'value'
		}));
	}

	if (p === '/gzip') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		res.setHeader('Content-Encoding', 'gzip');
		zlib.gzip('hello world', function(err, buffer) {
			res.end(buffer);
		});
	}

	if (p === '/deflate') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		res.setHeader('Content-Encoding', 'deflate');
		zlib.deflate('hello world', function(err, buffer) {
			res.end(buffer);
		});
	}

	if (p === '/sdch') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		res.setHeader('Content-Encoding', 'sdch');
		res.end('fake sdch string');
	}

	if (p === '/timeout') {
		setTimeout(function() {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/plain');
			res.end('text');
		}, 1000);
	}

	if (p === '/cookie') {
		res.statusCode = 200;
		res.setHeader('Set-Cookie', ['a=1', 'b=1']);
		res.end('cookie');
	}

	if (p === '/size/chunk') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		setTimeout(function() {
			res.write('test');
		}, 50);
		setTimeout(function() {
			res.end('test');
		}, 100);
	}

	if (p === '/size/long') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		res.end('testtest');
	}

	if (p === '/encoding/gbk') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/html');
		res.end(convert('<meta charset="gbk"><div>中文</div>', 'gbk'));
	}

	if (p === '/encoding/gb2312') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/html');
		res.end(convert('<meta http-equiv="Content-Type" content="text/html; charset=gb2312"><div>中文</div>', 'gb2312'));
	}

	if (p === '/encoding/shift-jis') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/html; charset=Shift-JIS');
		res.end(convert('<div>日本語</div>', 'Shift_JIS'));
	}

	if (p === '/encoding/euc-jp') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/xml');
		res.end(convert('<?xml version="1.0" encoding="EUC-JP"?><title>日本語</title>', 'EUC-JP'));
	}

	if (p === '/encoding/utf8') {
		res.statusCode = 200;
		res.end('中文');
	}

	if (p === '/redirect/301') {
		res.statusCode = 301;
		res.setHeader('Location', '/inspect');
		res.end();
	}

	if (p === '/redirect/302') {
		res.statusCode = 302;
		res.setHeader('Location', '/inspect');
		res.end();
	}

	if (p === '/redirect/303') {
		res.statusCode = 303;
		res.setHeader('Location', '/inspect');
		res.end();
	}

	if (p === '/redirect/307') {
		res.statusCode = 307;
		res.setHeader('Location', '/inspect');
		res.end();
	}

	if (p === '/redirect/308') {
		res.statusCode = 308;
		res.setHeader('Location', '/inspect');
		res.end();
	}

	if (p === '/redirect/chain') {
		res.statusCode = 301;
		res.setHeader('Location', '/redirect/301');
		res.end();
	}

	if (p === '/error/redirect') {
		res.statusCode = 301;
		//res.setHeader('Location', '/inspect');
		res.end();
	}

	if (p === '/error/400') {
		res.statusCode = 400;
		res.setHeader('Content-Type', 'text/plain');
		res.end('client error');
	}

	if (p === '/error/500') {
		res.statusCode = 500;
		res.setHeader('Content-Type', 'text/plain');
		res.end('server error');
	}

	if (p === '/error/reset') {
		res.destroy();
	}

	if (p === '/error/json') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.end('invalid json');
	}

	if (p === '/empty') {
		res.statusCode = 204;
		res.end();
	}

	if (p === '/inspect') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		var body = '';
		req.on('data', function(c) { body += c });
		req.on('end', function() {
			res.end(JSON.stringify({
				method: req.method,
				url: req.url,
				headers: req.headers,
				body: body
			}));
		});
	}

}