import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { sendVerificationReminder, cleanUpReminderLogs } from '../utils/reminder.utils.js';

export const scheduleAJob = () => {
  const scheduler = new ToadScheduler();
  const taskOne = new AsyncTask('send reminder', sendVerificationReminder, (err: Error) => {
    console.error(err.message);
  });
  const taskTwo = new AsyncTask('Delete Stale Reminders', cleanUpReminderLogs, (err: Error) => {
    console.error(err.message);
  });
  const jobOne = new SimpleIntervalJob({ minutes: 1 }, taskOne, { preventOverrun: true, id: 'id_1' });
  const jobTwo = new SimpleIntervalJob({ minutes: 24 }, taskTwo, { preventOverrun: true, id: 'id_2' });
  scheduler.addSimpleIntervalJob(jobOne);
  scheduler.addSimpleIntervalJob(jobTwo);

  console.log('The status of sendVerificationReminder job :: ', scheduler.getById('id_1').getStatus()); // returns Error (job not found)

  console.log('The status of cleanUpReminderLogs job :: ', scheduler.getById('id_2').getStatus()); // returns "stopped" and can be started again
};
