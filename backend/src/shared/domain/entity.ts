/* eslint-disable no-underscore-dangle */
import { UniqueID } from './uniqueId';

export abstract class Entity<T> {
  protected readonly _id: UniqueID;

  public readonly props: T;

  constructor(props: T, id?: UniqueID) {
    this._id = id || new UniqueID();
    this.props = props;
  }

  get id(): UniqueID {
    return this._id;
  }

  equals(eo: Entity<T>): boolean {
    if (eo === null || eo === undefined) {
      return false;
    }
    if (this === eo) {
      return true;
    }
    if (!(eo instanceof Entity)) {
      return false;
    }
    return this._id.equals(eo._id);
  }
}
