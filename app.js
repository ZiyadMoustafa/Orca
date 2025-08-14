const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

const app = express();

// 1) MIDDLEWARES
app.use(cors());

// Set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// const limiter = rateLimit({
//   limit: 5,
//   windowMs: 15 * 60 * 1000,
//   message: 'لقد تجاوزت عدد المحاولات المسموح بها، حاول لاحقًا ',
// });

// app.use('/api/v1/users/login', limiter); // apply limiter to all routes start with /api

// Putting all data in the body into request obj to read it
app.use(express.json());

app.use(cookieParser());

// Data sanitization against NoSQL query injection comments
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xss());

// 3) ROUTES
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/favorites', favoriteRoutes);

// Handler for Unhandled Routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
