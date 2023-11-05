
export interface BusinessCreationBody {
    name?: string;
    description?: string;
    businessCategoryUuid?: string;
    country?: string;
    stateAndProvince?: string;
    city?: string;
    street?: string;
    postalCode?: string;
    logoUrl?: string;
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
}