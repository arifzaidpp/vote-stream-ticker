import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Paginated } from "src/common/models/pagination.model";
import { User } from "../../models/user.model";
import { IsBoolean, IsOptional } from "class-validator";

@ObjectType()
export class UserPaginated extends Paginated(User) {}

@InputType()
export class UserFilter {
    @Field(() => Boolean, {nullable: true}) 
    @IsBoolean()
    @IsOptional()
    isPremium?: boolean;

    @Field(() => Boolean, {nullable: true})
    @IsBoolean()
    @IsOptional()
    isPremiumPlus?: boolean;

    @Field(() => Boolean, {nullable: true})
    @IsBoolean()
    @IsOptional()
    isAuthor ?: boolean;
}