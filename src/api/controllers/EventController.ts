import {Body, Get, JsonController, Post, QueryParams} from 'routing-controllers';
import {PostRegisterQuery, RegisterQuery, SignedUserQuery} from './requests/EventType';
import {EventService} from '../services/EventService';

@JsonController('/event')
export class EventController {

    constructor(private eventService: EventService) {}

    @Get('/register')
    public getRegisterData(@QueryParams() query: RegisterQuery): Promise<object> {
        return this.eventService.getRegisterData(query);
    }

    @Post('/register')
    public register(@Body() data: PostRegisterQuery): Promise<object | undefined> {
        return this.eventService.register(data);
    }

    @Get('/nft-detail')
    public getNftDetail(@QueryParams() query: RegisterQuery): Promise<object> {
        return this.eventService.getNftData(query);
    }

    @Post('/verify')
    public confirmSignedUser(@Body() data: SignedUserQuery): Promise<object | undefined> {
        return this.eventService.confirmSignedUser(data);
    }
}
