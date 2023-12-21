
export interface BusinessCreationBody {
    name?: string;
    description?: string;
    businessCategoryUuid?: string;
    country?: string;
    stateAndProvince?: string;
    city?: string;
    street?: string;
    postalCode?: string;
    logoUrl?: string | null;
    phoneNumber?: string;
    businessEmail?: string;
    openTime?: string;
    closeTime?: string;
    daysOfOperation?: string[];
    websiteUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    facebookUrl?: string;
    publicId?: string | null;
    version?: number | null;
    signature?: string | null;
    deleteLogo?: boolean;
}

export interface BusinessSearchRequestBody {
    paging: Paging;
    search: Search;
}

export interface Search {
    filters: Filters[];
}
export interface Paging {
    page: number;
    limit: number;
    sortBy: string;
    sortDirection: string;
}

export interface Filters {
    targetFieldName: string;
    values: string[] | string;
}
