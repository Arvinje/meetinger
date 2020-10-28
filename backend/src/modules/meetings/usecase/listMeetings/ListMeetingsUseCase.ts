import moment from 'moment';
import { Err, Ok, Result } from '@hqoss/monads';
import { UseCase } from '@src/shared/core/useCase';
import {
  MeetingCategory,
  Response as MeetingCategoryResponse,
} from '@meetings/domain/MeetingCategory';
import { MeetingRepo } from '@meetings/repos/MeetingRepo';
import { UnexpectedError, ValidationError } from '@src/shared/core/AppError';
import { MeetingLocation } from '@meetings/domain/MeetingLocation';
import { MeetingItemView } from '@meetings/domain/MeetingItemView';
import { MeetingItemViewMap } from '@meetings/mappers/MeetingItemViewMap';
import { ListMeetingsRequest } from './ListMeetingsRequest';
import { ListMeetingsResponse } from './ListMeetingsResponse';

type Response = Result<ListMeetingsResponse, ValidationError | UnexpectedError>;

export class ListMeetingsUseCase implements UseCase<ListMeetingsRequest, Promise<Response>> {
  private meetingRepo: MeetingRepo;

  constructor(meetingRepo: MeetingRepo) {
    this.meetingRepo = meetingRepo;
  }

  async execute(request: ListMeetingsRequest): Promise<Response> {
    const locationOrError = await MeetingLocation.create(request.location);
    if (locationOrError.isErr()) return Err(locationOrError.unwrapErr());

    let catOrError: MeetingCategoryResponse;
    if (request.category) {
      catOrError = await MeetingCategory.create(request.category);
      if (catOrError.isErr()) return Err(catOrError.unwrapErr());
    }

    let month: string;
    if (request.month) {
      month = request.month.trim();
      if (!moment(month, 'YYYY-MM', true).isValid())
        return Err(ValidationError.create('month is not valid'));
    } else {
      month = moment().format('YYYY-MM');
    }

    let meetingItemViews: MeetingItemView[];
    try {
      meetingItemViews = await this.meetingRepo.fetchMeetingItemViews(
        locationOrError.unwrap(),
        month,
        catOrError ? catOrError.unwrap() : undefined
      );
    } catch (error) {
      return Err(UnexpectedError.wrap(error));
    }

    const viewDTOs = meetingItemViews.map((view) => MeetingItemViewMap.toDTO(view));

    return Ok<ListMeetingsResponse>({ meetings: viewDTOs });
  }
}
