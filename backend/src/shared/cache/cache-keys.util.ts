// import { Category } from '@prisma/client';
import { UserFilter } from 'src/modules/auth/dto/user/user.dto';
// import { AuthorTypeFilter } from 'src/modules/content/dto/author-type.input';
// import { AuthorFilter } from 'src/modules/content/dto/author.input';
// import { CategoryFilter } from 'src/modules/content/dto/category.input';
// import { ContentFilterInput } from 'src/modules/content/dto/content-item.input';
// import { RevisionFilter } from 'src/modules/content/dto/content-revision.input';
// import { PacketFilter } from 'src/modules/content/dto/packet.input';
// import { SeriesFilter } from 'src/modules/content/dto/series.input';
// import { TagFilter } from 'src/modules/content/dto/tag.input';
// import { SubscriptionPlanFilter } from 'src/modules/subscription/dto/subscription-plan.input';

/**
 * Generate cache keys for various entities
 */
export const cacheKeys = {
  user: (id: number) => `user:id-${id}`,
  users: (
    search = '',
    take = 10,
    skip = 0,
    field = 'id',
    direction = 'ASC',
    filter?: UserFilter,
  ) =>
    `users:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,
  userCount: (filter?: UserFilter) => `user:count:${JSON.stringify(filter)}`,
  admin: (id: number) => `admin:id-${id}`,
  admins: (
    search = '',
    take = 10,
    skip = 0,
    field = 'id',
    direction = 'ASC',
    filter?: any,
  ) =>
    `admins:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,
  adminCount: (filter?: any) => `admin:count:${JSON.stringify(filter)}`,
  role: (id: number) => `role:id-${id}`,
  roles: (
    search: string,
    take: number,
    skip: number,
    field: string,
    direction: string,
  ) =>
    `roles:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}`,
  pendingVerification: (email: string) => `pending-verification:${email}`,
  passwordReset: (token: string) => `password-reset:${token}`,
  adminPasswordReset: (token: string) => `admin-password-reset:${token}`,

  //categories
  // categories: (
  //   search: string,
  //   take: number,
  //   skip: number,
  //   field: string,
  //   direction: string,
  //   filter?: CategoryFilter,
  // ) =>
  //   `categories:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,
  // categoryById: (id: number) => `category:id-${id}`,
  // categoryBySlug: (slug: string) => `category:slug-${slug}`,
  // categoryCount: (filter?: Partial<Category>) =>
  //   `category:count:${JSON.stringify(filter)}`,

  //tags
  // tags: (
  //   search: string,
  //   take: number,
  //   skip: number,
  //   field: string,
  //   direction: string,
  //   filter?: TagFilter,
  // ) =>
  //   `tags:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,
  // tagById: (id: number) => `tag:id-${id}`,
  // tagByName: (name: string) => `tag:name-${name}`,
  // tagCount: (filter?: TagFilter) => `tag:count:${JSON.stringify(filter)}`,

  // //packets
  // packets: (
  //   search: string,
  //   take: number,
  //   skip: number,
  //   field: string,
  //   direction: string,
  //   filter?: PacketFilter,
  // ) =>
  //   `packets:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,
  // packetById: (id: number) => `packet:id-${id}`,
  // packetBySlug: (slug: string) => `packet:slug-${slug}`,
  // packetCount: (filter?: PacketFilter) =>
  //   `packet:count:${JSON.stringify(filter)}`,

  // //series
  // series: (
  //   search: string,
  //   take: number,
  //   skip: number,
  //   field: string,
  //   direction: string,
  //   filter?: SeriesFilter,
  // ) =>
  //   `series:all:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,
  // seriesById: (id: number) => `series:id-${id}`,
  // seriesBySlug: (slug: string) => `series:slug-${slug}`,
  // seriesCount: (filter?: SeriesFilter) =>
  //   `series:count:${JSON.stringify(filter)}`,

  // //authors
  // authors: (
  //   search: string,
  //   take: number,
  //   skip: number,
  //   field: string,
  //   direction: string,
  //   filter?: any,
  // ) =>
  //   `authors:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,
  // authorById: (id: number) => `author:id-${id}`,
  // authorByUserId: (userId: number) => `author:userId-${userId}`,
  // authorByPenName: (penName: string) => `author:penName-${penName}`,
  // authorCount: (filter?: AuthorFilter) =>
  //   `author:count:${JSON.stringify(filter)}`,

  // // author type
  // authorTypeCount: (filter?: AuthorTypeFilter) =>
  //   `authorTypes:count:${JSON.stringify(filter)}`,
  // authorTypes: (
  //   search: string,
  //   take: number,
  //   skip: number,
  //   field: string,
  //   direction: string,
  //   filter?: AuthorTypeFilter,
  // ) =>
  //   `authorTypes:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,

  // authorTypeById: (id: number) => `authorType:id-${id}`,

  // //content
  // content: (
  //   search: string,
  //   take: number,
  //   skip: number,
  //   field: string,
  //   direction: string,
  //   filter?: ContentFilterInput,
  // ) =>
  //   `content:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,
  // contentById: (id: number) => `content:id-${id}`,
  // contentBySlug: (slug: string) => `content:slug-${slug}`,
  // contentCount: (filter?: ContentFilterInput) =>
  //   `content:count:${JSON.stringify(filter)}`,

  // //content revision
  // contentRevisions: (
  //   search: string,
  //   take: number,
  //   skip: number,
  //   field: string,
  //   direction: string,
  //   filter?: any,
  // ) =>
  //   `contentRevisions:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,
  // contentRevisionById: (id: number) => `contentRevision:id-${id}`,
  // latestContentRevision: (id: number) => `contentRevision:latest-${id}`,
  // contentRevisionCount: (filter?: RevisionFilter) =>
  //   `contentRevision:count:${JSON.stringify(filter)}`,

  //user submission
  userSubmissions: (
    search: string,
    take: number,
    skip: number,
    field: string,
    direction: string,
    filter?: any,
  ) =>
    `userSubmissions:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,
  userSubmissionById: (id: number) => `userSubmission:id-${id}`,
  userSubmissionBySlug: (slug: string) => `userSubmission:slug-${slug}`,
  userSubmissionCount: (filter?: any) =>
    `userSubmission:count:${JSON.stringify(filter)}`,

  userSubmissionsByUserId: (
    userId: number,
    search: string,
    take: number,
    skip: number,
    field: string,
    direction: string,
    filter?: any,
  ) =>
    `userSubmission:userId-${userId}:search-${search}:take-${take}:skip-${skip}:field-${field}:direction-${direction}:filter-${JSON.stringify(filter)}`,

  //media
  media: (
    search: string,
    take: number,
    skip: number,
    field: string,
    direction: string,
    filter?: any,
  ) =>
    `medias:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,
  mediaById: (id: number) => `media:id:${id}`,
  mediaByFileUrl: (fileUrl: string) =>
    `media:url:${encodeURIComponent(fileUrl)}`,
  mediaByContentId: (contentId: number) => `media:contentId:${contentId}`,

  //subscription
  // subscriptionPlans: (
  //   search: string,
  //   take: number,
  //   skip: number,
  //   field: string,
  //   direction: string,
  //   filter?: SubscriptionPlanFilter,
  // ) =>
  //   `subscriptionPlans:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:filter:${JSON.stringify(filter)}`,
  // subscriptionPlanById: (id: number) => `subscriptionPlan:id-${id}`,
  // subscriptionPlanCount: (filter?: SubscriptionPlanFilter) =>
  //   `subscriptionPlan:count:${JSON.stringify(filter)}`,

  // admin action history
  adminActions: (take: number, skip: number, entity: string, filter?: any) =>
    `adminAction:take:${take}:skip:${skip}:entity:${entity}:filter:${JSON.stringify(filter)}`,

  // system settings
  systemSettings: () => 'systemSettings:all',

  //user subscription
  userSubscriptions: (
    search: string,
    take: number,
    skip: number,
    field: string,
    direction: string,
    userId: number,
  ) =>
    `userSubscriptions:search:${search}:take:${take}:skip:${skip}:field:${field}:direction:${direction}:userId:${userId}`,
  userSubscriptionById: (id: number) => `userSubscription:id-${id}`,
  userSubscriptionByUserId: (userId: number) =>
    `userSubscription:userId-${userId}`,

  // active user subscription
  activeUserSubscription: (userId: number): string => {
    return `user:${userId}:active-subscription`;
  },
};