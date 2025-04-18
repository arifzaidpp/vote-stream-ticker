// import { Field, InputType, ObjectType } from "@nestjs/graphql";
// import { Paginated } from "src/common/models/pagination.model";
// import { IsBoolean, IsOptional } from "class-validator";
// import { Election, ElectionStatus } from "../../model/election.model";

// @ObjectType()
// export class ElectionPaginated extends Paginated(Election) {}

// @InputType()
// export class ElectionFilter {
//     @Field(() => String, { nullable: true })
//     name?: string;

//     @Field(() => ElectionStatus, { nullable: true })
//     status?: ElectionStatus; // Ensure ElectionStatus is an enum or valid type

//     @Field(() => Boolean, { nullable: true })
//     @IsOptional()
//     @IsBoolean()
//     isActive?: boolean;
// }
