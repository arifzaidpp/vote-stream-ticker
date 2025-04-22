import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Paginated } from "../../../../common/models/pagination.model";
import { User } from "../../models/user.model";
import { IsBoolean, IsOptional } from "class-validator";

@ObjectType()
export class UserPaginated extends Paginated(User) {}

@InputType()
export class UserFilter {
    @Field(() => String, { nullable: true })
    email?: string;
    
    @Field(() => String, { nullable: true })
    fullName?: string;
    
    @Field(() => Boolean, { nullable: true })
    @IsOptional()
    @IsBoolean()
    isVerified?: boolean;
}