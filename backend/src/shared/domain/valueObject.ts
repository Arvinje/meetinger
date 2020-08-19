import shallowEqual from 'shallowequal';

interface ValueObjectProps {
  [index: string]: unknown;
}

export abstract class ValueObject<T extends ValueObjectProps> {
  public readonly props: T;

  constructor(props: T) {
    this.props = props;
  }

  equals(vo: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }
    if (!(vo instanceof ValueObject)) {
      return false;
    }
    return shallowEqual(this.props, vo.props);
  }
}
