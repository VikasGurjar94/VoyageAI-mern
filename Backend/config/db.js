const { Sequelize } = require('sequelize');
require('dotenv').config();

// Detect if connecting to Aiven cloud DB (requires SSL)
const isAiven = (process.env.DB_HOST || '').includes('aivencloud.com');
// Always parse port as a number; fallback to 3306 if not set
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: DB_PORT,
    logging: false,
    // SSL is required for Aiven cloud MySQL (self-signed cert)
    ...(isAiven && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
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
    console.log(`Connecting to MySQL at ${process.env.DB_HOST}:${DB_PORT} DB=${process.env.DB_NAME} USER=${process.env.DB_USER} SSL=${isAiven}`);
    await sequelize.authenticate();
    console.log('MySQL connected successfully ✅');
  } catch (error) {
    console.error('Unable to connect to MySQL:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.original?.code);
    console.error('  Error:', error.original?.sqlMessage || error.original?.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };