const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('categorie', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,

    },
    img:{
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'YUhSMGNITTZMeTlqWkc0dWFXTnZiaTFwWTI5dWN5NWpiMjB2YVdOdmJuTXlMelE1TVM5UVRrY3ZOVEV5TDNOb2IzQndhVzVuTFdKaGMydGxkQzB4WHpRM09USTJMbkJ1Wnc9PQ=='
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  },{
    timestamps: false,
  });
};