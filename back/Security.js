class Security {
  constructor(db) {
    this.db = db;
    this.permission = new Map();
    this.loadPermissions();
  }

  async loadPermissions() {
    try {
      const query = `
        SELECT sp.permission_id, m.method_na, o.object_de, pr.profile_id
        FROM security.permission sp
        INNER JOIN security.method m ON m.method_id = sp.method_id
        INNER JOIN security.object o ON o.object_id = m.object_id
        INNER JOIN security.profile pr ON pr.profile_id = sp.profile_id
      `;
      const result = await this.db.execute(query, null);
      result.rows.forEach(element => {
        const key = `${element.profile_id}_${element.method_na}_${element.object_de}`;
        this.permission.set(key, true);
      });
    } catch (error) {
      console.error("Error loading permissions:", error);
    }
  }

  hasPermission(jsonData) {
    const key = `${jsonData.userProfile}_${jsonData.methodName}_${jsonData.objectName}`;
    return this.permission.get(key) || false;
  }

  async executeMethod(jsonData) {
    try {
      const ComponentClass = require(`./BO/${jsonData.objectName}.js`);
      const instance = new ComponentClass();
      if (typeof instance[jsonData.methodName] === 'function') {
        await instance[jsonData.methodName](jsonData.params);
      } else {
        console.error(`Method ${jsonData.methodName} not found in ${jsonData.objectName}`);
      }
    } catch (error) {
      console.error("Error executing method:", error);
    }
  }
}

module.exports = Security;
