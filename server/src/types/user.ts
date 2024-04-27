export interface UserDetailsForEmail {
  uuid: string;
<<<<<<< HEAD
  email: string;
  firstName: string;
=======
  email?: string;
>>>>>>> 2b032ad (created the logic for get user to send emails)
}

export interface ReminderLogDetails {
  uuid: string;
  userUuid: string;
  numberOfTimesSent?: number;
  modifiedUtc?: Date;
  createdUtc?: Date;
  emailType?: 'VERIFY_EMAIL' | 'CREATE_PROFILE';
}
