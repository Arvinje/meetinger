import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { MeetingView } from '@meetings/domain/MeetingView';
import { MeetingViewDTO } from '@meetings/dtos/MeetingViewDTO';
import { AttendeeDetailsMap } from './AttendeeDetailsMap';

export class MeetingViewMap {
  public static dynamoToDomain(rawItems: AttributeMap[]): MeetingView {
    const [rawMeetinView, ...rawAttendeesDetails] = rawItems;

    const attendeesDetails = rawAttendeesDetails.map((rawDetails) =>
      AttendeeDetailsMap.dynamoToDomain(rawDetails)
    );

    const meetingView = MeetingView.create({
      id: rawMeetinView.PK?.S || rawMeetinView.GSI2PK?.S,
      title: rawMeetinView.Title.S,
      description: rawMeetinView.Description.S,
      startsAt: new Date(rawMeetinView.GSI1SK?.S || rawMeetinView.GSI2SK?.S),
      location: rawMeetinView.GSI1PK.S.split('#')[0],
      createdBy: rawMeetinView.GSI2PK.S.split('#')[0],
      remainingSeats: Number(rawMeetinView.RemainingSeats.N),
      availableSeats: Number(rawMeetinView.AvailableSeats.N),
      attendees: attendeesDetails,
    });

    return meetingView.unwrap();
  }

  public static toDTO(meetingView: MeetingView): MeetingViewDTO {
    const attendees = meetingView.attendees.map((attendeeDetails) =>
      AttendeeDetailsMap.toDTO(attendeeDetails)
    );
    return {
      id: meetingView.id,
      title: meetingView.title,
      description: meetingView.description,
      startsAt: meetingView.startsAt.toISOString(),
      location: meetingView.location,
      remainingSeats: meetingView.remainingSeats,
      availableSeats: meetingView.availableSeats,
      createdBy: meetingView.createdBy,
      attendees,
    };
  }
}
