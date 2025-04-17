import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PendingUser {
    @Field()
    email: string;

    @Field()
    passwordHash: string;

    @Field()
    verificationToken: string;

    @Field()
    fullName: string;

    @Field({ nullable: true }) // Optional fields should be marked nullable
    ipAddress?: string;

    @Field({ nullable: true })
    userAgent?: string;

    @Field()
    createdAt: Date;
}