import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { sendVerificationReminder, cleanUpReminderLogs } from '../utils/reminder.utils';

export const scheduleAJob = () => {
  const scheduler = new ToadScheduler();
  const taskOne = new AsyncTask('send reminder', sendVerificationReminder, (err: Error) => {
    console.error(err.message);
  });
  const taskTwo = new AsyncTask('Delete Stale Reminders', cleanUpReminderLogs, (err: Error) => {
    console.error(err.message);
  });
  const jobOne = new SimpleIntervalJob({ hours: 5 }, taskOne, { preventOverrun: true });
  const jobTwo = new SimpleIntervalJob({ hours: 24 }, taskTwo, { preventOverrun: true });
  scheduler.addSimpleIntervalJob(jobOne);
  scheduler.addSimpleIntervalJob(jobTwo);
};
