export async function firebaseMessaging(
  ctx: Context,
  next: () => Promise<void>
) {
  ctx.set('Cache-Control', 'no-store')

  ctx.status = 200
  ctx.body = `importScripts('https://www.gstatic.com/firebasejs/9.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.4.0/firebase-messaging-compat.js');
importScripts('./firebase-config.js');
importScripts('https://t.themarketer.com/firebase.js');`

  await next()
}
