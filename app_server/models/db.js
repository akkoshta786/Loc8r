var mongoose = require('mongoose');
require('./location');

// Defined a database connection string
// Opened a Mongoose connection at application startup
var dbURI = "mongodb://localhost:27017/Loc8r";
mongoose.connect(dbURI);

// Monitored the Mongoose connection events
mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});

// Monitored some Node process events so that we can close the Mongoose connection when the application ends
var gracefulShutdown = (msg, callbacks) => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected through ' + msg)
    callbacks();
  })
}

process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2')
  })
})

process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  })
})

process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0);
  })
})