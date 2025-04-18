import { InputType, Field, ID } from '@nestjs/graphql';
import { CreateResultInput } from '../result/create-result.input';

@InputType()
export class CreateCountingRoundInput {
  @Field()
  roundNumber: number;

  @Field(() => ID)
  boothId: string;

  @Field(() => Boolean, { defaultValue: false })
  isPublished?: boolean;

  @Field(() => [CreateResultInput], { nullable: true })
  results?: CreateResultInput[];
}