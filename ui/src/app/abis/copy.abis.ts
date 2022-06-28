import { readdirSync } from 'fs';
import * as path from 'path';

export const createPath = async () => {
  let dir = path.join(__dirname, '..');
  console.log(dir);
};
