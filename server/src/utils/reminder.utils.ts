import prisma from '../utils/prisma.client';
import { UserDetailsForEmail, ReminderLogDetails } from '@src/types/user';
import { EmailType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import sendgrid from '@sendgrid/mail';
import { hashSync, compareSync } from 'bcrypt';
sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);
const clientBaseUrl = process.env.CLIENT_BASE_URL;

export interface VerifyEmailData {
  uuid?: string;
  userUuid: string;
  numberOfTimesSent: number;
  email: string;
  modifiedUtc?: Date;
  firstName: string;
  emailType?: EmailType;
}

/**
 * This fetches users that were created beteween 2 hours to 24 hours and has been verified
 */

export const getUserToBusinessProfileEmailRem = async (): Promise<UserDetailsForEmail[]> => {
  // fetch users who has not been verified with 6 - 24 hours
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const users = await prisma.user.findMany({
    where: {
      createdUtc: {
        gte: twentyFourHoursAgo,
        lt: twoHoursAgo,
      },
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
const getFilteredUserFromReminder = async (
  emailType: EmailType,
  upperBoundTime: Date,
  lowerBoundTime: Date,
  desiredNumberOfTimes: number
): Promise<ReminderLogDetails[]> => {
  const reminders = await prisma.user_profile_reminder_logs.findMany({
    where: {
      modifiedUtc: {
        gte: lowerBoundTime,
        lt: upperBoundTime,
      },
      emailType: emailType,
      numberOfTimesSent: {
        lt: desiredNumberOfTimes,
      },
    },
    select: {
      uuid: true,
      userUuid: true,
      numberOfTimesSent: true,
      createdUtc: true,
      modifiedUtc: true,
      emailType: true,
    },
  });
  return reminders;
};

/**
 * returns a map of userUUid to array of user Email and user firstName
 *
 * @param {string[]} includedUuid The number to raise.
 */
export const getUsersUsingIds = async (includedUuid: string[]): Promise<{ [x: string]: string[] }> => {
  const users = await prisma.user.findMany({
    where: {
      uuid: {
        in: includedUuid,
      },
      verified: false,
    },
    select: {
      email: true,
      uuid: true,
      firstName: true,
    },
  });
  let result: { [x: string]: string[] } = {};
  users.forEach(usr => {
    result[usr.uuid] = [usr.email, usr.firstName];
  });
  return result;
};

/**
 * Fetched reminder of type verify email.
 *
 */
const getReminderTypeEmailVerify = async (): Promise<ReminderLogDetails[]> => {
  let reminderTypeEmailVerify = await prisma.user_profile_reminder_logs.findMany({
    where: {
      emailType: EmailType.VERIFY_EMAIL,
    },
    select: {
      uuid: true,
      userUuid: true,
    },
  });
  return reminderTypeEmailVerify;
};

/**
 * This is responsible for updating the database after the email has been sent
 * @param {VerifyEmailData[]} reminderToUpsert a list of object contain information required to update the DB.
 */
export const afterEffectEmailVerify = async (reminderToUpsert: VerifyEmailData[]): Promise<string> => {
  let uuidArr: string[] = reminderToUpsert.map(rem => rem.uuid).filter(remUuid => remUuid != undefined);
  let userUuidArr: string[] = reminderToUpsert.map(rem => rem.userUuid).filter(remUserUUid => remUserUUid != undefined);
  let reminderTypeEmailVerify: ReminderLogDetails[] = await getReminderTypeEmailVerify();
  let uuidsToUpdate: string[] = [];
  let userUuidsToUpdate: { [key: string]: string } = {};
  reminderTypeEmailVerify.forEach(remToUp => {
    if (uuidArr.includes(remToUp.uuid)) {
      uuidsToUpdate.push(remToUp.uuid);
    }
    if (userUuidArr.includes(remToUp.userUuid)) {
      userUuidsToUpdate[remToUp.userUuid] = remToUp.uuid;
    }
  });
  let operations = reminderToUpsert.map(thisReminder => {
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

    return prisma.user_profile_reminder_logs.create({
      data: {
        uuid: '' + uuidv4(),
        createdUtc: new Date(),
        modifiedUtc: new Date(),
        emailType: thisReminder.emailType ?? EmailType.CREATE_PROFILE,
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
  let mapOfUserUuidToUuid: { [key: string]: string } = {};
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
  let result: { [key: string]: string } = {};
  let operations = userUuids.map(thisUuid => {
    const uniqueString = uuidv4() + thisUuid;
    const hashedUniqueString = hashSync(uniqueString, 10);
    result[thisUuid] = uniqueString;
    return prisma.user_verification.update({
      where: {
        uuid: mapOfUserUuidToUuid[thisUuid],
      },
      data: {
        uniqueString: hashedUniqueString,
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

  let uniqueString = await getMapOfUserIdToUniqueString(userUuids);
  let result = reminderToUpsert.map(data => {
    if (data.email) {
      let link = `${((clientBaseUrl + '/verify-email/' + data.userUuid) as string) + '/' + uniqueString[data.userUuid]}`;
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
    console.log('The result after a try to upsert ' + upsertResult);
    return apiResult;
  } catch (error) {
    console.log('An error occured while trying to send verification mail ', JSON.stringify(error));
  }
};