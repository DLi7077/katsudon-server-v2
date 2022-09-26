import { Storage } from '@google-cloud/storage';
import path from 'path';

const serviceKey = path.join(__dirname, '../../src/utils/katsudon-cloud.json');
const storage = new Storage({
  keyFilename: serviceKey
});

export default storage;
