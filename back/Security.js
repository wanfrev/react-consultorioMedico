class Security {
  constructor(db) {
    this.db = db;
    this.permission = new Map();
    this.initializePermissions();
  }

  async initializePermissions() {
    try {
      const result = await this.db.runQueryByKey({ key: 'loadPermissions' });
      result.forEach(element => {
        const key = `${element.profile_id}_${element.method_na}_${element.object_de}`;
        this.permission.set(key, true);
      });
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  }

  checkUserPermission(jsonData) {
    const key = `${jsonData.userProfile}_${jsonData.methodName}_${jsonData.objectName}`;
    return this.permission.get(key) || false;
  }

  async invokeMethod(jsonData) {
    if (!this.checkUserPermission(jsonData)) {
      console.error('Permission denied');
      return;
    }

    try {
      const ComponentClass = require(`./BO/${jsonData.objectName}.js`);
      const instance = new ComponentClass();
      if (typeof instance[jsonData.methodName] === 'function') {
        await instance[jsonData.methodName](jsonData.params);
      } else {
        console.error(`Method ${jsonData.methodName} not found in ${jsonData.objectName}`);
      }
    } catch (error) {
      console.error('Error executing method:', error);
    }
  }
}

module.exports = Security;
