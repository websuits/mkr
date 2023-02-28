export async function firebaseConfig(ctx: Context, next: () => Promise<void>) {
  ctx.set('Cache-Control', 'no-store')

  ctx.status = 200
  ctx.body = `const firebaseConfig = {
    apiKey: "AIzaSyA3c9lHIzPIvUciUjp1U2sxoTuaahnXuHw",
    projectId: "themarketer-e5579",
    messagingSenderId: "125832801949",
    appId: "1:125832801949:web:0b14cfa2fd7ace8064ae74"
  };
  firebase.initializeApp(firebaseConfig);`

  await next()
}
