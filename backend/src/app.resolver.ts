import { Resolver, Query } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';

@Resolver()
export class AppResolver {
  @Query(() => String)
  // @Throttle({ default: { limit: 1, ttl: 600000 } })
  getHello(): string {
    return 'Hello, World!';
  }
}