import {Get, JsonController, QueryParams} from 'routing-controllers';
import {RegisterQuery} from './requests/EventType';
import {EventService} from '../services/EventService';

@JsonController('/event')
export class EventController {

    constructor(private eventService: EventService) {}

    @Get('/register')
    public getRegisterData(@QueryParams() query: RegisterQuery): Promise<object> {
        return this.eventService.getRegisterData(query);
    }
}
