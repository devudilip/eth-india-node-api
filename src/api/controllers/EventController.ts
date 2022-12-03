import {Get, JsonController, QueryParams} from 'routing-controllers';
import {RegisterQuery} from './requests/EventType';

@JsonController('/event')
export class EventController {
    @Get('/register')
    public getRegisterData(@QueryParams() query: RegisterQuery): Promise<object> {
        return undefined;
    }
}
