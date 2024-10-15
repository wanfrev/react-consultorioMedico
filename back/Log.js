const Log = class {
  constructor() {
    this.TYPE_ERROR = 0;
    this.TYPE_WARNING = 1;
    this.TYPE_INFO = 2;
    this.TYPE_DEBUG = 3;
    this.activation = [true, false, false, false]; //se debe leer desde un archivo json (config)
  }

  show(param) {
    switch (typeof param) {
      case "string": {
        console.log(param);
        break;
      }
      case "object": {
        switch (param.type) {
          case this.TYPE_ERROR: {
            if (this.activation[0]) {
              console.log("message: " + param.message + "- type: error");
            }
            break;
          }
          case this.TYPE_WARNING: {
            if (this.activation[1]) {
              console.log("message: " + param.message + "- type: warning");
            }
            break;
          }
          case this.TYPE_INFO: {
            if (this.activation[2]) {
              console.log("message: " + param.message + "- type: info");
            }
            break;
          }
          case this.TYPE_DEBUG: {
            if (this.activation[3]) {
              console.log("message: " + param.message + "- type: debug");
            }
            break;
          }
        }
        break;
      }

      default:
        break;
    }
  }
};
module.exports = Log;
