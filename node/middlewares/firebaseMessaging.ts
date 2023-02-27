export async function firebaseMessaging(
  ctx: Context,
  next: () => Promise<void>
) {
  ctx.status = 200
  ctx.body = `firebase-messaging-sw.js content here`

  await next()
}
