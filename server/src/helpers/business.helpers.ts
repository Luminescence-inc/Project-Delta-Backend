import businessService from '../services/business.service.js';

type Empty = null | undefined | '';

interface IConstructWhereClause {
  cn: string | Empty;
  cty?: string | Empty;
  st?: string | Empty;
  query?: string | Empty;
  cat?: string | Empty;
}

interface IConstructPaginationProperties {
  page: string | Empty;
  limit: string | Empty;
  sortBy?: string | Empty;
  sortDirection?: string | Empty;
}

type IWhereClause = {
  [key: string]: {
    in?: string[];
    contains?: string;
  };
};

const createInClause = (key: string, values: string[]): { [key: string]: { in: string[] } } => ({
  [key]: {
    in: values,
  },
});

const createContainsClause = (
  key: string,
  value: string
): { [key: string]: { contains: string; mode: 'insensitive' } } => ({
  [key]: { contains: value, mode: 'insensitive' },
});

/**
 * // document
 *
 * @param params object containing search parameters for business profiles
 * @returns object containing where clause for prisma
 * @description construct where clause for prisma based on search parameters provided
 */

// construct where clause for prisma
export const constructWhereClause = async (params: IConstructWhereClause): Promise<IWhereClause> => {
  const bizService = new businessService();
  const whereClause: IWhereClause = {};
  const keyReplacements = {
    cn: 'country',
    cty: 'city',
    st: 'stateAndProvince',
    query: 'name',
    cat: 'businessCategoryUuid',
  };

  for (const key of Object.keys(params)) {
    if (!params[key as keyof IConstructWhereClause]) continue;

    // capitalize certain keys
    const shouldCapitalize = ['cn', 'cty', 'st'].includes(key);
    const isCategoryKey = key === 'cat';
    let categories: string[] = [];

    if (isCategoryKey) {
      categories = await bizService.fetchCategoriesByName(params.cat as string);
    }

    if (categories.length === 0 && isCategoryKey) {
      console.log('No categories found', params);
      // add an INVALID UUID to prevent the query from returning any results
      // Note; this uuid doesn't exist in the database
      const invalid_uuid = 'f7baa3fa-c78a-403e-92fc-b24bca6c9350';
      categories.push(invalid_uuid);
    }

    const clauseProps = isCategoryKey
      ? createInClause(
          keyReplacements[key] ?? key,
          shouldCapitalize
            ? [params[key as keyof IConstructWhereClause] as string]
            : categories.length > 0
              ? categories
              : [params[key as keyof IConstructWhereClause] as string]
        )
      : createContainsClause(
          keyReplacements[key as keyof IConstructWhereClause] ?? key,
          shouldCapitalize
            ? (params[key as keyof IConstructWhereClause] as string)
            : (params[key as keyof IConstructWhereClause] as string)
        );

    // @ts-expect-error
    // append clause to where clause object
    whereClause[keyReplacements[key] ?? key] = clauseProps[keyReplacements[key] ?? key];
  }

  return whereClause;
};

// construct pagination properties
export const constructPaginationProperties = (params: IConstructPaginationProperties) => {
  const defaultLimit = 10;
  const defaultPage = 1;
  const defaultSortBy = 'createdUtc';
  const defaultSortDirection = 'desc';

  let properties: { take: number; skip: number; orderBy: { [key: string]: 'asc' | 'desc' } } = {
    take: defaultLimit,
    skip: 0,
    orderBy: {
      [defaultSortBy]: defaultSortDirection as 'asc' | 'desc',
    },
  };

  for (const key of Object.keys(params)) {
    if (
      params[key as keyof IConstructPaginationProperties] ||
      typeof params[key as keyof IConstructPaginationProperties] !== 'undefined' ||
      params[key as keyof IConstructPaginationProperties] !== null
    ) {
      switch (key) {
        case 'page':
          properties.skip =
            (Number(params.page ?? defaultPage) - 1) * (params.limit ? Number(params.limit) : defaultLimit);
          break;
        case 'limit':
          properties.take = Number(params.limit ? params.limit : defaultLimit);
          break;
        case 'sortBy':
          properties.orderBy = {
            [(params.sortBy as string) ?? defaultSortBy]:
              (params.sortDirection as 'asc' | 'desc') ?? defaultSortDirection,
          };
          break;
      }
    }
  }
  return properties;
};
