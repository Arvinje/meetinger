// import { Entity } from '@src/shared/domain/entity';
// import { UniqueID } from '@src/shared/domain/uniqueId';
// import { Result, Ok } from '@hqoss/monads';
// import { UserName } from '@src/modules/users/domain/UserName';
// import { MeetingID } from './MeetingID';
// import { MeetingTitle } from './MeetingTitle';
// import { MeetingDescription } from './MeetingDescription';
// import { Attendee } from './Attendee';

// export interface MeetingDetailsProps {
//   title: string;
//   description?: string;
//   startsAt: Date;
// }

// export class MeetingDetails extends Entity<MeetingDetailsProps> {
//   get id(): MeetingID {
//     // eslint-disable-next-line no-underscore-dangle
//     return MeetingID.create(this._id);
//   }

//   get title(): string {
//     return this.props.title;
//   }

//   get description(): string {
//     return this.props.description;
//   }

//   get startsAt(): Date {
//     return this.props.startsAt;
//   }

//   // eslint-disable-next-line no-useless-constructor
//   private constructor(props: MeetingProps, id?: UniqueID) {
//     super(props, id);
//   }

//   public static create(props: MeetingProps, id?: UniqueID): Result<Meeting, void> {
//     const defaultProps: MeetingProps = {
//       ...props,
//       attendees: props.attendees || [],
//       createdAt: props.createdAt || new Date(),
//     };
//     const meeting = new Meeting(defaultProps, id);
//     return Ok(meeting);
//   }
// }
