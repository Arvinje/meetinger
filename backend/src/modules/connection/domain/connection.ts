export interface ConnectionProps {
  id: string;
  userId?: string;
  username?: string;
}

export class Connection {
  private props: ConnectionProps;

  private constructor(props: ConnectionProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get username(): string {
    return this.props.username;
  }

  public static create(props: ConnectionProps): Connection {
    const connection = new Connection(props);
    return connection;
  }
}
