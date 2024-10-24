const fs = require('fs');

class Log {
  constructor() {
    this.TYPE_ERROR = 0;
    this.TYPE_WARNING = 1;
    this.TYPE_INFO = 2;
    this.TYPE_DEBUG = 3;
    this.activation = this.initializeConfig();
  }

  initializeConfig() {
    try {
      const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
      return config.activation || [true, false, false, false];
    } catch (error) {
      console.error('Error loading config:', error);
      return [true, false, false, false];
    }
  }

  displayLogMessage(param) {
    if (typeof param === 'string') {
      console.log(param);
    } else if (typeof param === 'object' && param.type !== undefined) {
      const types = ['error', 'warning', 'info', 'debug'];
      if (this.activation[param.type]) {
        console.log(`message: ${param.message} - type: ${types[param.type]}`);
      }
    }
  }
}

module.exports = Log;
