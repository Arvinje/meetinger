import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { RegisteredMeetingView } from '../domain/RegisteredMeetingView';
import { RegisteredMeetingViewDTO } from '../dtos/RegisteredMeetingViewDTO';

export class RegisteredMeetingMap {
  public static dynamoToDomain(raw: AttributeMap): RegisteredMeetingView {
    return RegisteredMeetingView.create({
      id: raw.PK.S.split('#')[0],
      title: raw.Title.S,
      startsAt: new Date(raw.GSI1SK.S),
      organizedByMe: !!raw.IsOrganizer.BOOL,
    });
  }

  public static toDTO(registeredMeetingView: RegisteredMeetingView): RegisteredMeetingViewDTO {
    return {
      id: registeredMeetingView.id,
      title: registeredMeetingView.title,
      startsAt: registeredMeetingView.startsAt.toISOString(),
      organizedByMe: registeredMeetingView.organizedByMe,
    };
  }
}
