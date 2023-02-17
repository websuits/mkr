export async function keepAlive(ctx: Context, next: () => Promise<any>) {
  const {
    vtex: { logger },
  } = ctx

  ctx.set('Cache-Control', 'no-store')

  logger.info({
    middleware: 'keepAlive',
    subject: `Pinged`,
  })

  ctx.status = 200

  await next()
}
