import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { UnexpectedError } from '@src/shared/core/AppError';
import { UniqueID } from '@src/shared/domain/uniqueId';
import { MeetingID } from '@meetings/domain/MeetingID';
import { MeetingView } from '@meetings/domain/MeetingView';
import { MeetingViewMap } from '@meetings/mappers/MeetingViewMap';
import { MeetingViewDTO } from '@meetings/dtos/MeetingViewDTO';
import { MeetingNotFoundError } from '@meetings/errors/MeetingErrors';
import { GetMeetingRequest } from './GetMeetingRequest';

type Response = Result<MeetingViewDTO, MeetingNotFoundError | UnexpectedError>;

export class GetMeetingUseCase implements UseCase<GetMeetingRequest, Promise<Response>> {
  private meetingRepo: MeetingRepo;

  constructor(meetingRepo: MeetingRepo) {
    this.meetingRepo = meetingRepo;
  }

  async execute(request: GetMeetingRequest): Promise<Response> {
    const meetingID = MeetingID.create(new UniqueID(request.meetingID));

    let meetingView: MeetingView;
    try {
      meetingView = await this.meetingRepo.fetchMeetingView(meetingID);
    } catch (error) {
      if (error instanceof MeetingNotFoundError) return Err(error);
      return Err(UnexpectedError.wrap(error));
    }

    return Ok(MeetingViewMap.toDTO(meetingView));
  }
}
