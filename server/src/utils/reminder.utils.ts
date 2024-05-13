<<<<<<< HEAD
import prisma from '../utils/prisma.client';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { UserDetailsForEmail } from '@src/types/user';
=======
import { UserDetailsForEmail } from '../types/user';
>>>>>>> 4e7da04 (updated imports)
=======
import prisma from '../utils/prisma.client.js';
import { UserDetailsForEmail } from '../types/user.js';
>>>>>>> e0eee37 (Feature/tec 81/confirm email reminder (#44))
import { EmailType } from '@prisma/client';
import { VerificationType } from '@prisma/client';
<<<<<<< HEAD
import { v4 as uuidv4 } from 'uuid';
import sendgrid from '@sendgrid/mail';
import { hashSync } from 'bcrypt';
sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);
const clientBaseUrl = process.env.CLIENT_BASE_URL;

export interface VerifyEmailData {
  userUuid: string;
  numberOfTimesSent: number;
  email: string;
  modifiedUtc?: Date;
  firstName: string;
  emailType?: EmailType;
}

const getVerfiedUserUuid = async (): Promise<string[]> => {
  let users = await prisma.user.findMany({
    where: {
      verified: true,
    },
    select: {
      uuid: true,
    },
  });
  return users.map(usr => usr.uuid);
};

export const cleanUpReminderLogs = async (): Promise<string> => {
  const now = new Date();
  const limitTime = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  let verifiedUserUuid = await getVerfiedUserUuid();
  let status: string;
  try {
    await prisma.user_profile_reminder_logs.deleteMany({
      where: {
        userUuid: {
          in: verifiedUserUuid,
        },
        createdUtc: {
          gt: limitTime,
        },
      },
    });
    status = 'Success';
  } catch (err) {
    status = 'Failed: ' + err;
  }
  return status;
};

/**
 * a helper function for getReminderRowsThatFit, fetches reminder rows that meet the criteria
 *
 * @param {number} desiredNumberOfTimes The maximum number of time the email needs to be sent .
 * @param {number} upperBoundTime The time that need to elaspe before we send another email
 * @param {number} lowerBoundTime\
 * @param {number} emailType The type of email we are looking to send.
 *
 */
const getEmailedUserUUIDs = async (userUuid: string[]): Promise<string[]> => {
<<<<<<< HEAD
  const reminders = await prisma.user_profile_reminder_logs.findMany({
    where: {
      emailType: EmailType.VERIFY_EMAIL,
      userUuid: {
        in: userUuid,
      },
    },
    select: {
      userUuid: true,
    },
  });
  return reminders.map(thisReminder => thisReminder.userUuid);
};

/**
 * returns a map of userUUid to array of user Email and user firstName
 *
 * @param {string[]} includedUuid The number to raise.
 */
const getUsersToRemindOfEmailVerification = async (
  upperBoundTime: Date,
  lowerBoundTime: Date
): Promise<UserDetailsForEmail[]> => {
  const users = await prisma.user.findMany({
    where: {
      createdUtc: {
        lt: upperBoundTime,
        gt: lowerBoundTime,
=======
import { UserDetailsForEmail, ReminderLogDetails } from '@src/types/user';
=======
import { UserDetailsForEmail } from '@src/types/user';
>>>>>>> 6704989 (Removed unsused code)
import { EmailType } from '@prisma/client';
=======
>>>>>>> 4e5077a (made the changes)
import { v4 as uuidv4 } from 'uuid';
import sendgrid from '@sendgrid/mail';
import { hashSync } from 'bcrypt';
sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);
const clientBaseUrl = process.env.CLIENT_BASE_URL;

export interface VerifyEmailData {
  userUuid: string;
  numberOfTimesSent: number;
  email: string;
  modifiedUtc?: Date;
  firstName: string;
  emailType?: EmailType;
}

const getVerfiedUserUuid = async (): Promise<string[]> => {
  let users = await prisma.user.findMany({
    where: {
      verified: true,
    },
    select: {
      uuid: true,
    },
  });
  return users.map(usr => usr.uuid);
};

export const cleanUpReminderLogs = async (): Promise<string> => {
  const now = new Date();
  const limitTime = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  let verifiedUserUuid = await getVerfiedUserUuid();
  let status: string;
  try {
    await prisma.user_profile_reminder_logs.deleteMany({
      where: {
        userUuid: {
          in: verifiedUserUuid,
        },
        createdUtc: {
          gt: limitTime,
        },
      },
<<<<<<< HEAD
      verified: true,
    },
    select: {
      email: true,
      uuid: true,
      firstName: true,
    },
  });

  console.log('The Users: ', users);
  return users;
};

/**
<<<<<<< HEAD
 * returns a map of userUUid to array of user Email and user firstName
 *
 * @param {string[]} includedUuid The number to raise.
 */
export const getUsersUsingIds = async (includedUuid: string[]): Promise<{ [x: string]: string[] }> => {
  const users = await prisma.user.findMany({
    where: {
      uuid: {
        in: includedUuid,
>>>>>>> 2b032ad (created the logic for get user to send emails)
      },
      verified: false,
    },
    select: {
      email: true,
      uuid: true,
<<<<<<< HEAD
<<<<<<< HEAD
      firstName: true,
    },
  });
  return users;
};
/**
 * This fetches information required send verification email
 */
const getReminderRowsThatFit = async (): Promise<VerifyEmailData[]> => {
  const now = new Date();
  const upperBoundTime = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const lowerBoundTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  let potentialUserToSendReminderEmail: UserDetailsForEmail[] = await getUsersToRemindOfEmailVerification(
    upperBoundTime,
    lowerBoundTime
  );
  let userUuids: string[] = potentialUserToSendReminderEmail.map(thisUser => thisUser.uuid);
  let emailedUserUUIDs: string[] = await getEmailedUserUUIDs(userUuids);
  let result: VerifyEmailData[] = potentialUserToSendReminderEmail
    .filter(ptUser => !emailedUserUUIDs.includes(ptUser.uuid))
    .map(ptUser => {
      return {
        numberOfTimesSent: 1,
        email: ptUser.email,
        firstName: ptUser.firstName,
        userUuid: ptUser.uuid,
      };
    });
  return result;
};

/**
 * This is responsible for updating the database after the email has been sent
 * @param {VerifyEmailData[]} reminderToUpsert a list of object contain information required to update the DB.
 */
const afterEffectEmailVerify = async (reminderToUpsert: VerifyEmailData[]): Promise<string> => {
  let operations = reminderToUpsert.map(thisReminder => {
    return prisma.user_profile_reminder_logs.create({
      data: {
        uuid: '' + uuidv4(),
        createdUtc: new Date(),
        modifiedUtc: new Date(),
        emailType: thisReminder.emailType ?? EmailType.VERIFY_EMAIL,
        numberOfTimesSent: thisReminder.numberOfTimesSent,
        userUuid: thisReminder.userUuid,
      },
    });
  });

  try {
    await prisma.$transaction(operations);
    return 'Success';
  } catch (error) {
    console.error('Failed to execute batch upsert:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    return 'Done';
  }
};

/**
 * The obtains a map of userId to Unique string for creating a new verification unique string.
 * @param {VerifyEmailData[]} userUuids a list of user uuids.
 */
const getMapOfUserIdToUniqueString = async (userUuids: string[]): Promise<{ [key: string]: string }> => {
  let mapOfUserUuidToUuid: { [key: string]: string | undefined } = {};
  let verification = await prisma.user_verification.findMany({
    where: {
      useruuid: {
        in: userUuids,
      },
    },
    select: {
      useruuid: true,
      uuid: true,
    },
  });
  verification.forEach(thisVerification => {
    mapOfUserUuidToUuid[thisVerification.useruuid] = thisVerification.uuid;
  });

  userUuids.forEach(userUuid => {
    if (!mapOfUserUuidToUuid.hasOwnProperty(userUuid)) {
      mapOfUserUuidToUuid[userUuid] = undefined;
    }
  });
  let result: { [key: string]: string } = {};
  let operations = userUuids.map(thisUuid => {
    const uniqueString = uuidv4() + thisUuid;
    const hashedUniqueString = hashSync(uniqueString, 10);
    result[thisUuid] = uniqueString;
    return prisma.user_verification.upsert({
      where: {
        uuid: mapOfUserUuidToUuid[thisUuid] ?? uuidv4(),
      },
      update: {
        uniqueString: hashedUniqueString,
        expiresUtc: new Date(Date.now() + 21600000),
      },
      create: {
        uniqueString: hashedUniqueString,
        expiresUtc: new Date(Date.now() + 21600000),
        createdUtc: new Date(),
        useruuid: thisUuid,
        type: VerificationType.EMAIL,
      },
    });
  });
  try {
    await prisma.$transaction(operations);
    return result;
  } catch (error) {
    console.error('Failed to execute batch upsert:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    return result;
  }
};

/**
 * This is responsible for sending email to the users
 *
 */
export const sendVerificationReminder = async () => {
  let reminderToUpsert = await getReminderRowsThatFit();
  let userUuids = reminderToUpsert.map(data => {
    return data.userUuid;
  });

  let mapOfUserIdToUniqueString = await getMapOfUserIdToUniqueString(userUuids);
  let result = reminderToUpsert.map(data => {
    if (data.email) {
      let link = `${((clientBaseUrl + '/verify-email/' + data.userUuid) as string) + '/' + mapOfUserIdToUniqueString[data.userUuid]}`;
      return sendgrid.send({
        from: 'BizConnect24 <noreply@bizconnect24.com>',
        templateId: 'd-6bfc7e7e38e64cc5965739c974aaca91',
        personalizations: [
          {
            to: `${data.email}`,
            subject: 'Email Verification Reminder',
            dynamicTemplateData: {
              link: link,
              firstName: data.firstName,
            },
          },
        ],
      });
    }
  });

  try {
    let apiResult = await Promise.all(result);
    reminderToUpsert = reminderToUpsert.map(data => {
      return { ...data, numberOfTimesSent: data.numberOfTimesSent + 1, modifiedUtc: new Date() };
    });
    let upsertResult = await afterEffectEmailVerify(reminderToUpsert);
    return apiResult;
  } catch (error) {}
};
=======
=======
      firstName: true,
>>>>>>> f3a2607 (added logic for scheduling emails)
    },
  });
  let result: { [x: string]: string[] } = {};
  users.forEach(usr => {
    result[usr.uuid] = [usr.email, usr.firstName];
  });
  return result;
};

/**
=======
>>>>>>> 7f3e767 (Added logic for email verification)
 * returns rows from the user_profile_reminder_logs table
 * where the userUUid is present in the list.
 *
 * @param {string[]} uuids The number to raise.
 */
const getUserInRemiderTable = async (uuids: string[]) => {
  const userInReminder = await prisma.user_profile_reminder_logs.findMany({
    where: {
      userUuid: {
        in: uuids,
      },
    },
  });
  console.log(userInReminder);
  return userInReminder;
};

/**
 * returns rows from the user_profile_reminder_logs table
 * that meet the criteria required for a second email to be sent
 *
 * @param {string[]} uuids The number to raise.
 */

/**
 * Returns the row of users to send the second business profile reminder
 *
 * @param {number} uuids The uuid of users.
 * @param {number} desiredCount The maximum number of time the email needs to be sent .
 * @param {number} upperBoundTime The time that need to elaspe before we send another email
 * @param {number} lowerBoundTime\
 * @param {number} emailType The type of email we are looking to send.
 *
 */
const getUsersToSendASecondEmail = async (
  uuids: string[],
  desiredCount: number,
  upperBoundTime: Date,
  lowerBoundTime: Date,
  emailType: EmailType
): Promise<ReminderLogDetails[]> => {
  const usersToSendSecondEmail = await prisma.user_profile_reminder_logs.findMany({
    where: {
      userUuid: {
        in: uuids,
      },
      numberOfTimesSent: {
        lt: desiredCount,
      },
      modifiedUtc: {
        gte: lowerBoundTime,
        lt: upperBoundTime,
      },
      emailType: emailType,
    },
    select: {
      uuid: true,
      userUuid: true,
    },
  });
  return usersToSendSecondEmail;
};

export const getAddressToProfileReminderEmail = async (): Promise<{ [key: string]: VerifyEmailData[] }> => {
  const now = new Date();
  let userToRemind: UserDetailsForEmail[] = await getUserToBusinessProfileEmailRem();
  let mapOfUuidToEmail: { [x: string]: string[] } = {};
  userToRemind.forEach(usr => {
    if (usr.email && usr.firstName) {
      mapOfUuidToEmail[usr.uuid] = [usr.email, usr.firstName];
    }
  });
  let uuidOfuserToRemind: string[] = userToRemind.map(user => user.uuid);
  let uuidOfUserInTable = new Set(
    await getUserInRemiderTable(uuidOfuserToRemind).then(reminders => {
      return reminders.map(reminder => reminder.userUuid).filter(checks => checks != undefined);
    })
  );
  let uuidNotInRemTab = uuidOfuserToRemind.filter(userUuid => !uuidOfUserInTable.has(userUuid));
  let userNotInRemTab: VerifyEmailData[] = uuidNotInRemTab.map(uuid => {
    return {
      email: mapOfUuidToEmail[uuid][0],
      firstName: mapOfUuidToEmail[uuid][1],
      uuid: '',
      userUuid: uuid,
      numberOfTimesSent: 0,
    };
  });
  const mapOfUsersToSendReminders: { [key: string]: VerifyEmailData[] } = {};
  const upperBoundTimeProfile = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lowerBoundTimeProfile = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  // get users where the count is less than 2, the lowerBoundTime is 48hrs, the upperBoundTime is 24hrs, the type is create profile
  let usersToSendSendMail: ReminderLogDetails[] = await getUsersToSendASecondEmail(
    uuidOfuserToRemind,
    2,
    upperBoundTimeProfile,
    lowerBoundTimeProfile,
    EmailType.CREATE_PROFILE
  ).then(usersToRemind => usersToRemind);

  let usersToSendSendMailArr: VerifyEmailData[] = usersToSendSendMail.map(usrToSendEmail => {
    return {
      email: mapOfUuidToEmail[usrToSendEmail.userUuid][0],
      firstName: mapOfUuidToEmail[usrToSendEmail.userUuid][1],
      userUuid: usrToSendEmail.userUuid,
      numberOfTimesSent: usrToSendEmail.numberOfTimesSent || 1,
      uuid: usrToSendEmail.uuid,
    };
  });
  mapOfUsersToSendReminders.firstTimeReminder = userNotInRemTab;
  mapOfUsersToSendReminders.secondTimeReminder = usersToSendSendMailArr;
  console.log('The users to send mail ', mapOfUsersToSendReminders);
  return mapOfUsersToSendReminders;
};
/**
 * This fetches information required send verification email
 */
export const getReminderRowsThatFit = async (): Promise<VerifyEmailData[]> => {
  const now = new Date();
  const upperBoundTime = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const lowerBoundTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  let uuidOfFilterUser: ReminderLogDetails[] = await getFilteredUserFromReminder(
    EmailType.VERIFY_EMAIL,
    upperBoundTime,
    lowerBoundTime,
    2
  );
  let userId: string[] = uuidOfFilterUser
    .map(thereminder => thereminder.userUuid)
    .filter(checks => checks != undefined);
  let usersMap: { [x: string]: string[] } = await getUsersUsingIds(userId);
  let result: VerifyEmailData[] = uuidOfFilterUser.map(reminderLog => {
    return {
      uuid: reminderLog.uuid,
      numberOfTimesSent: reminderLog.numberOfTimesSent || 1,
      email: usersMap[reminderLog.userUuid][0],
      firstName: usersMap[reminderLog.userUuid][1],
      userUuid: reminderLog.userUuid,
    };
  });
  return result;
=======
    });
    status = 'Success';
  } catch (err) {
    status = 'Failed: ' + err;
  }
  return status;
>>>>>>> 650feec (Updated Migration and Reminder Util)
};

/**
 * a helper function for getReminderRowsThatFit, fetches reminder rows that meet the criteria
 *
 * @param {number} desiredNumberOfTimes The maximum number of time the email needs to be sent .
 * @param {number} upperBoundTime The time that need to elaspe before we send another email
 * @param {number} lowerBoundTime\
 * @param {number} emailType The type of email we are looking to send.
 *
 */
const getEmailedUserUUIDs = async (userUuid: string[]): Promise<string[]> => {
  console.log('The User UUID ', userUuid);
=======
>>>>>>> 397d790 (removed console logs)
  const reminders = await prisma.user_profile_reminder_logs.findMany({
    where: {
      emailType: EmailType.VERIFY_EMAIL,
      userUuid: {
        in: userUuid,
      },
    },
    select: {
      userUuid: true,
    },
  });
  return reminders.map(thisReminder => thisReminder.userUuid);
};

/**
 * returns a map of userUUid to array of user Email and user firstName
 *
 * @param {string[]} includedUuid The number to raise.
 */
const getUsersToRemindOfEmailVerification = async (
  upperBoundTime: Date,
  lowerBoundTime: Date
): Promise<UserDetailsForEmail[]> => {
  const users = await prisma.user.findMany({
    where: {
      createdUtc: {
        lt: upperBoundTime,
        gt: lowerBoundTime,
      },
      verified: false,
    },
    select: {
      email: true,
      uuid: true,
      firstName: true,
    },
  });
  return users;
};
/**
 * This fetches information required send verification email
 */
const getReminderRowsThatFit = async (): Promise<VerifyEmailData[]> => {
  const now = new Date();
  const upperBoundTime = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const lowerBoundTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  let potentialUserToSendReminderEmail: UserDetailsForEmail[] = await getUsersToRemindOfEmailVerification(
    upperBoundTime,
    lowerBoundTime
  );
  let userUuids: string[] = potentialUserToSendReminderEmail.map(thisUser => thisUser.uuid);
  let emailedUserUUIDs: string[] = await getEmailedUserUUIDs(userUuids);
  let result: VerifyEmailData[] = potentialUserToSendReminderEmail
    .filter(ptUser => !emailedUserUUIDs.includes(ptUser.uuid))
    .map(ptUser => {
      return {
        numberOfTimesSent: 1,
        email: ptUser.email,
        firstName: ptUser.firstName,
        userUuid: ptUser.uuid,
      };
    });
  return result;
};

/**
 * This is responsible for updating the database after the email has been sent
 * @param {VerifyEmailData[]} reminderToUpsert a list of object contain information required to update the DB.
 */
const afterEffectEmailVerify = async (reminderToUpsert: VerifyEmailData[]): Promise<string> => {
  let operations = reminderToUpsert.map(thisReminder => {
<<<<<<< HEAD
    if (Object.keys(userUuidsToUpdate).includes(thisReminder.userUuid)) {
      let theUuid = userUuidsToUpdate[thisReminder.userUuid];
      return prisma.user_profile_reminder_logs.update({
        where: {
          uuid: theUuid,
        },
        data: {
          numberOfTimesSent: thisReminder.numberOfTimesSent,
          modifiedUtc: thisReminder.modifiedUtc || new Date(),
        },
      });
    }

<<<<<<< HEAD
export const afterEffect = async () => {};
>>>>>>> 2b032ad (created the logic for get user to send emails)
=======
=======
>>>>>>> 650feec (Updated Migration and Reminder Util)
    return prisma.user_profile_reminder_logs.create({
      data: {
        uuid: '' + uuidv4(),
        createdUtc: new Date(),
        modifiedUtc: new Date(),
        emailType: thisReminder.emailType ?? EmailType.VERIFY_EMAIL,
        numberOfTimesSent: thisReminder.numberOfTimesSent,
        userUuid: thisReminder.userUuid,
      },
    });
  });

  try {
    await prisma.$transaction(operations);
    return 'Success';
  } catch (error) {
    console.error('Failed to execute batch upsert:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    return 'Done';
  }
};

/**
 * The obtains a map of userId to Unique string for creating a new verification unique string.
 * @param {VerifyEmailData[]} userUuids a list of user uuids.
 */
const getMapOfUserIdToUniqueString = async (userUuids: string[]): Promise<{ [key: string]: string }> => {
  let mapOfUserUuidToUuid: { [key: string]: string | undefined } = {};
  let verification = await prisma.user_verification.findMany({
    where: {
      useruuid: {
        in: userUuids,
      },
    },
    select: {
      useruuid: true,
      uuid: true,
    },
  });
  verification.forEach(thisVerification => {
    mapOfUserUuidToUuid[thisVerification.useruuid] = thisVerification.uuid;
  });

  userUuids.forEach(userUuid => {
    if (!mapOfUserUuidToUuid.hasOwnProperty(userUuid)) {
      mapOfUserUuidToUuid[userUuid] = undefined;
    }
  });
  let result: { [key: string]: string } = {};
  let operations = userUuids.map(thisUuid => {
    const uniqueString = uuidv4() + thisUuid;
    const hashedUniqueString = hashSync(uniqueString, 10);
    result[thisUuid] = uniqueString;
    return prisma.user_verification.upsert({
      where: {
        uuid: mapOfUserUuidToUuid[thisUuid] ?? uuidv4(),
      },
      update: {
        uniqueString: hashedUniqueString,
        expiresUtc: new Date(Date.now() + 21600000),
      },
      create: {
        uniqueString: hashedUniqueString,
        expiresUtc: new Date(Date.now() + 21600000),
        createdUtc: new Date(),
        useruuid: thisUuid,
        type: VerificationType.EMAIL,
      },
    });
  });
  try {
    await prisma.$transaction(operations);
    return result;
  } catch (error) {
    console.error('Failed to execute batch upsert:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    return result;
  }
};

/**
 * This is responsible for sending email to the users
 *
 */
export const sendVerificationReminder = async () => {
  let reminderToUpsert = await getReminderRowsThatFit();
  let userUuids = reminderToUpsert.map(data => {
    return data.userUuid;
  });

  let mapOfUserIdToUniqueString = await getMapOfUserIdToUniqueString(userUuids);
  let result = reminderToUpsert.map(data => {
    if (data.email) {
      let link = `${((clientBaseUrl + '/verify-email/' + data.userUuid) as string) + '/' + mapOfUserIdToUniqueString[data.userUuid]}`;
      return sendgrid.send({
        from: 'BizConnect24 <noreply@bizconnect24.com>',
        templateId: 'd-6bfc7e7e38e64cc5965739c974aaca91',
        personalizations: [
          {
            to: `${data.email}`,
            subject: 'Email Verification Reminder',
            dynamicTemplateData: {
              link: link,
              firstName: data.firstName,
            },
          },
        ],
      });
    }
  });

  try {
    let apiResult = await Promise.all(result);
    reminderToUpsert = reminderToUpsert.map(data => {
      return { ...data, numberOfTimesSent: data.numberOfTimesSent + 1, modifiedUtc: new Date() };
    });
    let upsertResult = await afterEffectEmailVerify(reminderToUpsert);
    return apiResult;
  } catch (error) {}
};
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
// getAddressToProfileReminderEmail();
let result = await sendVerificationReminder();
// console.log(result);
>>>>>>> f3a2607 (added logic for scheduling emails)
=======
>>>>>>> 7f3e767 (Added logic for email verification)
=======
sendVerificationReminder();
>>>>>>> 650feec (Updated Migration and Reminder Util)
=======
>>>>>>> fb2747a (Remove uneccessary files)
