var express = require('express');

// Constants
var DEFAULT_PORT = 8080;
var PORT = process.env.PORT || DEFAULT_PORT;

// App
var app = express();
app.use(express.static(__dirname + '/static'));

app.listen(PORT)
console.log('Running on http://localhost:' + PORT);
