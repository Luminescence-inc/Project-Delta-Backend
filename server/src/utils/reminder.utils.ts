import prisma from '../utils/prisma.client';
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
      },
      verified: false,
    },
    select: {
      email: true,
      uuid: true,
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
