import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { AttendeeDetails } from '@meetings/domain/AttendeeDetails';
import { AttendeeDetailsDTO } from '@meetings/dtos/AttendeeDetailsDTO';

export class AttendeeDetailsMap {
  public static dynamoToDomain(raw: AttributeMap): AttendeeDetails {
    const attendeeDetails = AttendeeDetails.create({
      username: raw.GSI1PK.S.split('#')[0],
      fullName: raw.FullName.S,
      isOrganizer: raw.IsOrganizer.BOOL,
    });

    return attendeeDetails.unwrap();
  }

  public static toDTO(attendeeDetails: AttendeeDetails): AttendeeDetailsDTO {
    return {
      username: attendeeDetails.username,
      fullName: attendeeDetails.fullName,
      isOrganizer: attendeeDetails.isOrganizer ? true : undefined,
    };
  }
}
