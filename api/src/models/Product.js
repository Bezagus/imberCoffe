const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('product', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,

    },
    img:{
      type: DataTypes.STRING,
      allowNull:true,
      defaultValue: 'YUhSMGNITTZMeTkzZDNjdVltbGphV1poYmk1MWVTOTNjQzFqYjI1MFpXNTBMM1Z3Ykc5aFpITXZNakF4Tmk4d09TOXdjbTlrZFdOMGJ5MXphVzR0YVcxaFoyVnVMbkJ1Wnc9PQ=='
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price:{
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    description:{
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue:{}
    }
  },{
    timestamps: false,
  });
};