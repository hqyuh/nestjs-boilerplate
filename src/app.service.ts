import * as packageJson from 'packageJson';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const name = packageJson.name;
    const version = packageJson.version;
    console.log(name, version);
    return `${name} v${version}`;
  }
}
