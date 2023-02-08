export async function status(ctx: Context, next: () => Promise<any>) {
  const {
    state: { code },
    clients: { status: statusClient },
  } = ctx
  // eslint-disable-next-line no-console
  console.log('Received code:', code)

  const statusResponse = await statusClient.getStatus(code)
  // eslint-disable-next-line no-console
  console.log('Status response:', statusResponse)

  const {
    headers,
    data,
    status: responseStatus,
  } = await statusClient.getStatusWithHeaders(code)
  // eslint-disable-next-line no-console
  console.log('Status headers', headers)
  // eslint-disable-next-line no-console
  console.log('Status data:', data)

  ctx.status = responseStatus
  ctx.body = data
  ctx.set('Cache-Control', headers['cache-control'])

  await next()
}
