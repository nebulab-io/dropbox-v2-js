var express = require('express');
var app = express();

app.use('/build', express.static(__dirname + '/build'));

app.set('view engine', 'ejs');
app.set('views', __dirname);


app.get('/', function (req, res) {
  res.render('index');
});

app.get('/auth', function (req, res) {
  res.render('auth');
});

app.listen(5050, function () {
  console.log('Example app listening on port 5050!');
});