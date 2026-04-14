import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordsService {
  async hash(password: string) {
    return bcrypt.hash(password, 10);
  }

  async compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
