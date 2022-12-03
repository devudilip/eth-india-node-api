import {Service} from 'typedi';
import {RegisterQuery} from '../controllers/requests/EventType';

@Service()
export class EventService {
    public async getRegisterData(registerQuery: RegisterQuery): Promise<string> {
        return 'undefined';
    }
}
