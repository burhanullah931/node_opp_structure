const { EventEmitter } = require('events');

// Singleton event bus for domain/application events
module.exports = new EventEmitter();

