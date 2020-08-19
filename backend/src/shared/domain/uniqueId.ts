import { nanoid } from 'nanoid';
import { Identifier } from './identifier';

export class UniqueID extends Identifier<string | number> {
  constructor(id?: string | number) {
    super(id || nanoid());
  }
}
