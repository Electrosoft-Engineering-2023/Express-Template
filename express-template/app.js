var createError = require('http-errors');
var express = require('express');
const expressLayouts = require('express-ejs-layouts')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var sensorsRouter = require('./routes/sensors');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set Templating Engine
app.use(expressLayouts)
app.set('layout', false)


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/sensors', sensorsRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//SOCKET IO PART
// When a new connection is requested
io.on('connection', function (socket) {
  console.log('Sensor Connected!');

  // Send to the connected user
  socket.emit('event', { message: 'Connected !!!!' });

  socket.on('', data => {
    console.log(data);
  });
  // On each "status", run this function
  socket.on('status', data => {
    console.log(data);
    io.emit('sensor', data);
  });

});

// Websocket client
client.on('connectFailed', function(error) {
  console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
  console.log('WebSocket Client Connected');
  connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function() {
      console.log('echo-protocol Connection Closed');
  });
  connection.on('message', function(message) {
      if (message.type === 'utf8') {
          console.log("Received: '" + message.utf8Data + "'");
      }
  });
  
  function sendNumber() {
      if (connection.connected) {
          var number = Math.round(Math.random() * 0xFFFFFF);
          connection.sendUTF(number.toString());
          setTimeout(sendNumber, 1000);
      }
  }
  sendNumber();
});

client.connect('ws://192.168.0.187/', 'echo-protocol');

//open server
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});


module.exports = app;
