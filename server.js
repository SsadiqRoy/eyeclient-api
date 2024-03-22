const dotenv = require('dotenv');
const path = require('node:path');

const errorManager = require('./utils/errorManager');

process.on('uncaughtException', (error) => {
  error.type = 'uncaughtExeption';
  errorManager.writeSync(error, true);
  process.exit(1);
});

//

dotenv.config({ path: path.join(__dirname, 'config.env') });

//

const database = require('./db');

async function connectToDB() {
  try {
    await database.authenticate();
    // await database.sync();
    await database.sync({ alter: true });

    console.log('Database Connection Successfull 🙏🙏');
  } catch (error) {
    console.log('🔥🔥 Database connection Error', error);
  }
}

connectToDB();
//

// const anob = { name: 'James', age: 24, mother: 'Janie', skills: { drawing: 'good', writing: 'excellent' } };

// console.log(Object.entries(anob));
//

const app = require('./app');

const server = app.listen(process.env.port, process.env.host, () => console.log('Eye Clent Api Started 🙏🙏'));

//

process.on('unhandledRejection', (error) => {
  error.type = 'unhandledRejection';
  errorManager.writeSync(error, true);
  server.close(() => {
    process.exit(1);
  });
});
