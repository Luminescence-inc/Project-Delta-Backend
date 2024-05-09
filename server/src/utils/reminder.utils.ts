import prisma from '../utils/prisma.client';
import { UserDetailsForEmail, ReminderLogDetails } from '@src/types/user';
import { EmailType } from '@prisma/client';
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

export const cleanUpReminderLogs = async (): Promise<string> => {
  const now = new Date();
  const limitTime = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  let status: string;
  try {
    await prisma.user_profile_reminder_logs.deleteMany({
      where: {
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
        expiresUtc: new Date(Date.now() + 21600000),
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
  console.log('The reminder to upsert', reminderToUpsert);
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
    console.log('The result after a try to upsert ' + upsertResult);
    return apiResult;
  } catch (error) {
    console.log('An error occured while trying to send verification mail ', JSON.stringify(error));
  }
};
sendVerificationReminder();
