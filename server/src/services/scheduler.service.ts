import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
<<<<<<< HEAD
<<<<<<< HEAD
import { sendVerificationReminder, cleanUpReminderLogs } from '../utils/reminder.utils';

export const scheduleAJob = () => {
  const scheduler = new ToadScheduler();
  const taskOne = new AsyncTask('send reminder', sendVerificationReminder, (err: Error) => {
    console.error(err.message);
  });
  const taskTwo = new AsyncTask('Delete Stale Reminders', cleanUpReminderLogs, (err: Error) => {
    console.error(err.message);
  });
  const jobOne = new SimpleIntervalJob({ hours: 1 }, taskOne, { preventOverrun: true });
  const jobTwo = new SimpleIntervalJob({ hours: 24 }, taskTwo, { preventOverrun: true });
<<<<<<< HEAD
  scheduler.addSimpleIntervalJob(jobOne);
  scheduler.addSimpleIntervalJob(jobTwo);
=======
import { sendVerificationReminder } from '@src/utils/reminder.utils';
=======
import { sendVerificationReminder, cleanUpReminderLogs } from '@src/utils/reminder.utils';
>>>>>>> 650feec (Updated Migration and Reminder Util)

export const scheduleAJob = () => {
  const scheduler = new ToadScheduler();
  const taskOne = new AsyncTask('send reminder', sendVerificationReminder, (err: Error) => {
    console.error(err.message);
  });
<<<<<<< HEAD
  const job = new SimpleIntervalJob({ hours: 1 }, task, { preventOverrun: true });
  scheduler.addSimpleIntervalJob(job);
>>>>>>> f3a2607 (added logic for scheduling emails)
=======
  const taskTwo = new AsyncTask('Delete Stale Reminders', cleanUpReminderLogs, (err: Error) => {
    console.error(err.message);
  });
  const jobOne = new SimpleIntervalJob({ hours: 1 }, taskOne, { preventOverrun: true });
  const jobTwo = new SimpleIntervalJob({ hours: 1 }, taskTwo, { preventOverrun: true });
=======
>>>>>>> 6704989 (Removed unsused code)
  scheduler.addSimpleIntervalJob(jobOne);
  scheduler.addSimpleIntervalJob(jobTwo);
>>>>>>> 650feec (Updated Migration and Reminder Util)
};
