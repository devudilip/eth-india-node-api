import {IsNotEmpty, IsString} from 'class-validator';

export class RegisterQuery {
    @IsNotEmpty()
    @IsString()
    public address: string;
}
