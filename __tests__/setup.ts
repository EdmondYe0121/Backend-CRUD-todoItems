import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.PORT = '4001'; // Use different port for testing

jest.setTimeout(10000);
