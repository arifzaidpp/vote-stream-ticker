export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ContentSortField {
  CREATED_AT = 'createdAt',
  PUBLISHED_AT = 'publishedAt',
  TITLE = 'title',
  VIEWS_COUNT = 'viewsCount',
  REACTIONS_COUNT = 'reactionsCount',
  COMMENTS_COUNT = 'commentsCount',
}

export enum UserSortField {
  CREATED_AT = 'createdAt',
  LAST_LOGIN = 'lastLogin',
  USERNAME = 'username',
}

export const DEFAULT_CONTENT_SORT = {
  field: ContentSortField.PUBLISHED_AT,
  direction: SortDirection.DESC,
};

export const DEFAULT_USER_SORT = {
  field: UserSortField.CREATED_AT,
  direction: SortDirection.DESC,
};