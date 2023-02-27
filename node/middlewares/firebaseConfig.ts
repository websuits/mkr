export async function firebaseConfig(ctx: Context, next: () => Promise<void>) {
  ctx.status = 200
  ctx.body = `firebase-config.js content here`

  await next()
}
