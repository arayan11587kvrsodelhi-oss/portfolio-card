/**
 * Local-dev-only helper: boots an embedded PostgreSQL instance so the
 * full stack can be exercised without a system PostgreSQL install.
 *
 * This file is NOT part of the app runtime and ships nothing to production.
 * It is only used for verification during development.
 */
import EmbeddedPostgres from 'embedded-postgres';

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: './.pgdata',
    user: 'postgres',
    password: 'postgres',
    port: 55432,
    persistent: true,
  });

  const action = process.argv[2] ?? 'start';

  if (action === 'stop') {
    await pg.stop();
    console.log('Embedded postgres stopped.');
    return;
  }

  const alreadyRunning = action === 'ensure';
  if (alreadyRunning) {
    console.log('Ensuring embedded postgres is running on :55432');
  }

  try {
    await pg.initialise();
  } catch (e) {
    // already initialised
    console.log('init note:', e instanceof Error ? e.message : e);
  }

  try {
    await pg.start();
  } catch (e) {
    console.log('start note:', e instanceof Error ? e.message : e);
  }

  try {
    await pg.createDatabase('portfolio_card');
  } catch (e) {
    console.log('db note:', e instanceof Error ? e.message : e);
  }

  console.log('DATABASE_URL=postgresql://postgres:postgres@localhost:55432/portfolio_card');

  // Keep the process alive only when asked to stay foreground.
  if (process.argv.includes('--keep-alive')) {
    setInterval(() => { }, 1 << 30);
  } else {
    await pg.stop();
    console.log('Embedded postgres stopped (one-shot).');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
