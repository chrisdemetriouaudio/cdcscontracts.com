// Standalone cron Worker: retries any failed booking notifications in the background,
// so a failed send gets another attempt even if nobody opens the dashboard for a while.
// Shares the same D1 database as the Pages Functions app.
import { retryFailedNotifications } from '../../functions/_lib/notify.js';

export default {
  async scheduled(event, env, ctx) {
    const result = await retryFailedNotifications(env, env.DB);
    console.log(`Retry sweep: checked ${result.checked}, retried ${result.retried}`);
  },
  async fetch() {
    return new Response('CDCS booking retry worker (cron only)', { status: 200 });
  },
};
