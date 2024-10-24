class Registro {
    async Crear(params) {
      // Lógica para crear un registro
      console.log('Creating record with params:', params);
      // Aquí puedes agregar la lógica para interactuar con la base de datos y crear el registro
    }
  
    async Borrar(params) {
      // Lógica para borrar un registro
      console.log('Deleting record with params:', params);
      // Aquí puedes agregar la lógica para interactuar con la base de datos y borrar el registro
    }
  
    async Actualizar(params) {
      // Lógica para actualizar un registro
      console.log('Updating record with params:', params);
      // Aquí puedes agregar la lógica para interactuar con la base de datos y actualizar el registro
    }
  
    async Obtener(params) {
      // Lógica para obtener un registro
      console.log('Getting record with params:', params);
      // Aquí puedes agregar la lógica para interactuar con la base de datos y obtener el registro
    }
  }
  
  module.exports = Registro;