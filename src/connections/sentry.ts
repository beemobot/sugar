import * as Sentry from '@sentry/node'
function init() {
    if (process.env.SENTRY_DSN == null) {
        console.error('Sentry is not configured, discarding request to start.')
        process.exit()
        return
    }

    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 1.0,  })
}

export const Sentryboo = { init: init }