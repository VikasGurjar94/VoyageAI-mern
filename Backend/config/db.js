const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    logging: false, // set to console.log to see SQL queries
    // SSL is required for cloud DBs (Aiven) in production, not needed locally
    ...(process.env.NODE_ENV === 'production' && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // needed for Aiven free tier self-signed cert
        },
      },
    }),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    console.log(`Connecting to MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT} DB=${process.env.DB_NAME} USER=${process.env.DB_USER}`);
    await sequelize.authenticate();
    console.log('MySQL connected successfully');
  } catch (error) {
    console.error('Unable to connect to MySQL:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.original?.code);
    console.error('  Error:', error.original?.sqlMessage || error.original?.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };