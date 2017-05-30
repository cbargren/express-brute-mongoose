'use strict';

var mongoose = require('mongoose');

var bruteForceSchema = new mongoose.Schema({
  _id: { type: String, index: 1 },
  data: {
    count: Number,
    lastRequest: Date,
    firstRequest: Date,
    ip: String
  },
  expires: { type: Date, index: { expires: '1d' } }
}, { collection: 'bruteforce' });

module.exports = bruteForceSchema;