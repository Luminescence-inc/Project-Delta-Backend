import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { sendVerificationReminder } from '@src/utils/reminder.utils';

export const scheduleAJob = () => {
  const scheduler = new ToadScheduler();
  const task = new AsyncTask('send reminder', sendVerificationReminder, (err: Error) => {
    console.error(err.message);
  });
  const job = new SimpleIntervalJob({ hours: 1 }, task, { preventOverrun: true });
  scheduler.addSimpleIntervalJob(job);
};
