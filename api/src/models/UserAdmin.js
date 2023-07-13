const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('userAdmin', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    img:{
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'YUhSMGNITTZMeTlsYkhCaGFYTmtaV3h2YzJwdmRtVnVaWE11WTI5dEwzZHdMV052Ym5SbGJuUXZkWEJzYjJGa2N5OHlNREUyTHpBM0wyWmhZMlZpYjI5ckxXRjJZWFJoY2kwM05qaDRORGcwTG1wd1p3PT0='
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    username:{
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    email:{
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
        validate: {
            is: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
    },
    rol:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2
    }
  },{
    timestamps: true,
  });
};