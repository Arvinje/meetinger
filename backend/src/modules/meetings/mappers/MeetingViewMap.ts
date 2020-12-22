import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { MeetingView } from '@meetings/domain/MeetingView';
import { MeetingViewDTO } from '@meetings/dtos/MeetingViewDTO';
import { AttendeeDetailsMap } from './AttendeeDetailsMap';

export class MeetingViewMap {
  public static dynamoToDomain(rawItems: AttributeMap[]): MeetingView {
    const [rawMeetinView] = rawItems;

    const [rawCategory, rawStartsAt] = rawMeetinView.GSI1SK.S.split('#');

    const meetingView = MeetingView.create({
      id: rawMeetinView.PK?.S,
      title: rawMeetinView.Title.S,
      description: rawMeetinView.Description.S,
      category: rawCategory,
      startsAt: new Date(rawStartsAt),
      place: rawMeetinView.GSI1PK.S.split('#')[0],
      address: rawMeetinView.Address?.S,
      createdBy: rawMeetinView.GSI2PK.S.split('#')[0],
      remainingSeats: Number(rawMeetinView.RemainingSeats.N),
      availableSeats: Number(rawMeetinView.AvailableSeats.N),
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
      category: meetingView.category,
      startsAt: meetingView.startsAt.toISOString(),
      place: meetingView.place,
      address: meetingView.address,
      remainingSeats: meetingView.remainingSeats,
      availableSeats: meetingView.availableSeats,
      createdBy: meetingView.createdBy,
      attendees,
    };
  }
}
