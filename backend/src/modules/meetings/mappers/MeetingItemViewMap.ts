import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { MeetingItemView } from '@meetings/domain/MeetingItemView';
import { MeetingItemViewDTO } from '@meetings/dtos/MeetingItemViewDTO';

export class MeetingItemViewMap {
  public static dynamoToDomain(raw: AttributeMap): MeetingItemView {
    const [rawCategory, rawStartsAt] = raw.GSI1SK.S.split('#');

    const meetingItemView = MeetingItemView.create({
      id: raw.PK.S,
      title: raw.Title.S,
      category: rawCategory,
      startsAt: new Date(rawStartsAt),
      remainingSeats: Number(raw.RemainingSeats.N),
      availableSeats: Number(raw.AvailableSeats.N),
    });

    return meetingItemView.unwrap();
  }

  public static toDTO(meetingItemView: MeetingItemView): MeetingItemViewDTO {
    return {
      id: meetingItemView.id,
      title: meetingItemView.title,
      category: meetingItemView.category,
      startsAt: meetingItemView.startsAt.toISOString(),
      remainingSeats: meetingItemView.remainingSeats,
      availableSeats: meetingItemView.availableSeats,
    };
  }
}
