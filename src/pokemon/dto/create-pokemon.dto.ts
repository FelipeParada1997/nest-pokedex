import { IsInt, IsPositive, IsString, Min, MinLength } from "class-validator";;

export class CreatePokemonDto {

    @IsInt()
    @Min(1)
    @IsPositive()
    num: number;
    
    @IsString()
    @MinLength(2)
    name: string;
}
