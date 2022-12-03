import {IsNotEmpty, IsString} from 'class-validator';

export class RegisterQuery {
    @IsNotEmpty()
    @IsString()
    public address: string;
}

export class PostRegisterQuery {
    @IsNotEmpty()
    @IsString()
    public address: string;

    @IsNotEmpty()
    @IsString()
    public sign_data: string;

    @IsNotEmpty()
    @IsString()
    public request: string;
}
