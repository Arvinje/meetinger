import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { UserName } from '@users/domain/UserName';
import { RegisteredMeetingView } from '@meetings/domain/RegisteredMeetingView';
import { RegisteredMeetingMap } from '@meetings/mappers/RegisteredMeetingMap';
import { ListRegisteredMeetingsRequest } from './ListRegisteredMeetingsRequest';
import { ListRegisteredMeetingsResponse } from './ListRegisteredMeetingsResponse';

type Response = Result<ListRegisteredMeetingsResponse, ValidationError | UnexpectedError>;

export class ListRegisteredMeetingsUseCase
  implements UseCase<ListRegisteredMeetingsRequest, Promise<Response>> {
  private meetingRepo: MeetingRepo;

  constructor(meetingRepo: MeetingRepo) {
    this.meetingRepo = meetingRepo;
  }

  async execute(request: ListRegisteredMeetingsRequest): Promise<Response> {
    const userNameOrError = await UserName.create(request.username);
    if (userNameOrError.isErr()) return Err(userNameOrError.unwrapErr());

    let registeredMeetingViews: RegisteredMeetingView[];
    try {
      registeredMeetingViews = await this.meetingRepo.fetchRegisteredMeetingViews(
        userNameOrError.unwrap()
      );
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }

    const viewDTOs = registeredMeetingViews.map((view) => RegisteredMeetingMap.toDTO(view));

    return Ok<ListRegisteredMeetingsResponse>({ meetings: viewDTOs });
  }
}
