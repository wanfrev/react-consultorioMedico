class Security {
  constructor(db) {
    this.db = db;
    this.permissions = {};
  }

  async initializePermissions() {
    try {
      const result = await this.db.runQueryByKey({ key: 'getAllPermissions' });
      if (Array.isArray(result)) {
        result.forEach(row => {
          if (!this.permissions[row.profile_id]) {
            this.permissions[row.profile_id] = [];
          }
          this.permissions[row.profile_id].push({
            method: row.method_na,
            object: row.object_na
          });
        });
      } else {
        console.error('Error al cargar los permisos: El resultado no es un array');
      }
    } catch (error) {
      console.error('Error al cargar los permisos', error);
    }
  }

  getPermission(jsonData) {
    const { userProfile, methodName, objectName } = jsonData;
    const userPermissions = this.permissions[userProfile] || [];
    return userPermissions.some(permission => 
      permission.method === methodName && permission.object === objectName
    );
  }

  async invokeMethod(jsonData) {
    // Implementación del método para invocar el método correspondiente
  }
}

module.exports = Security;