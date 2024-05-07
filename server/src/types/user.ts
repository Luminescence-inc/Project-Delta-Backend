export interface UserDetailsForEmail {
  uuid: string;
  email?: string;
  firstName: string;
}

export interface ReminderLogDetails {
  uuid: string;
  userUuid: string;
  numberOfTimesSent?: number;
  modifiedUtc?: Date;
  createdUtc?: Date;
  emailType?: 'VERIFY_EMAIL' | 'CREATE_PROFILE';
}
