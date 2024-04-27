import prisma from '../utils/prisma.client';
<<<<<<< HEAD
import { UserDetailsForEmail } from '@src/types/user';
import { EmailType } from '@prisma/client';
import { VerificationType } from '@prisma/client';
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
import { EmailType } from '@prisma/client';

export const getUserToSendVerfyEmailRem = async (): Promise<UserDetailsForEmail[]> => {
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
    },
    select: {
      email: true,
      uuid: true,
    },
  });

  console.log('The Users: ', users);
  return users;
};

export const getUserWithIds = async (includedUuid: string[]): Promise<{ [x: string]: string }> => {
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
    },
  });
  let result: { [x: string]: string } = {};
  users.forEach(usr => {
    result[usr.uuid] = usr.email;
  });
  return result;
};

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
  console.log('The Reminder is ', reminders);
  return reminders;
};
export interface VerifyEmailData {
  uuid: string;
  numberOfTimesSent?: number;
  email: string;
}

export const getAddressToVerificationEmail = async (): Promise<VerifyEmailData[]> => {
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
  let usersMap: { [x: string]: string } = await getUserWithIds(userId);
  return uuidOfFilterUser.map(reminderLog => {
    return {
      uuid: reminderLog.uuid,
      numberOfTimesSent: reminderLog.numberOfTimesSent,
      email: usersMap[reminderLog.userUuid],
    };
  });
};

export const getAddressToProfileReminderEmail = async (): Promise<{ [key: string]: BusinessEmailData[] }> => {
  const now = new Date();
  let userToRemind: UserDetailsForEmail[] = await getUserToSendVerfyEmailRem();
  let mapOfUuidToEmail: { [x: string]: string } = {};
  userToRemind.forEach(usr => {
    if (usr.email) {
      mapOfUuidToEmail[usr.uuid] = usr.email;
    }
  });
  let uuidOfuserToRemind: string[] = userToRemind.map(user => user.uuid);
  let uuidOfUserInTable = new Set(
    await getUserInRemiderTable(uuidOfuserToRemind).then(reminders => {
      return reminders.map(reminder => reminder.userUuid).filter(checks => checks != undefined);
    })
  );
  let uuidNotInRemTab = uuidOfuserToRemind.filter(userUuid => !uuidOfUserInTable.has(userUuid));
  const mapOfUsersToSendReminders: { [key: string]: VerifyEmailData[] } = {};
  const upperBoundTimeProfile = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lowerBoundTimeProfile = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  // get users where the count is less than 2, the lowerBoundTime is 48hrs, the upperBoundTime is 24hrs, the type is create profile
  let usersToSendSendMail: string[] = await getUsersToSendASecondEmail(
    uuidOfuserToRemind,
    2,
    upperBoundTimeProfile,
    lowerBoundTimeProfile,
    EmailType.CREATE_PROFILE
  ).then(usersToRemind => usersToRemind.map(usr => usr.uuid));

  mapOfUsersToSendReminders.firstTimeReminder = userToRemind
    .filter(user => uuidNotInRemTab.includes(user.uuid))
    .map(usr => usr.email)
    .filter(checks => checks != undefined);
  mapOfUsersToSendReminders.secondTimeReminder = userToRemind
    .filter(user => usersToSendSendMail.includes(user.uuid))
    .map(usr => usr.email)
    .filter(checks => checks != undefined);
  return mapOfUsersToSendReminders;
};

export const afterEffect = async () => {};
>>>>>>> 2b032ad (created the logic for get user to send emails)
