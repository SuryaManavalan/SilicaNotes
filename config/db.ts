import { createPool } from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

const pool = createPool({
  host: 'svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com',
  port: 3333,
  user: 'surya-1837c',
  password: 'tPBnARy64tKBkGUHtGzOd4dPRkmVaDYw',
  database: 'db_surya_86f13',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync(path.resolve(__dirname, '../../../../certs/singlestore_bundle.pem'))
  }
});

export default pool;
