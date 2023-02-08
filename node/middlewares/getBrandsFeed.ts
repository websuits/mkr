export function formatError(error: any) {
  if (error.response) {
    /*
     * The request was made and the server responded with a
     * status code that falls out of the range of 2xx
     */
    return `
    Failed with status: ${error.response.status};
    data: ${JSON.stringify(error.response.data)};
    headers: ${JSON.stringify(error.response.headers)}
     `
  }

  if (error.request) {
    /*
     * The request was made but no response was received, `error.request`
     * is an instance of XMLHttpRequest in the browser and an instance
     * of http.ClientRequest in Node.js
     */
    return `Failed with no response for request: with no response`
  }

  // Something happened in setting up the request and triggered an Error
  return `Failed with message: ${error.message}`
}


export async function getBrandsFeed(ctx: Context, next: () => Promise<any>) {
  const {
    vtex: {logger},
    clients: {brandsFeed},
  } = ctx

  try {
    // @ts-ignore
    const response = await brandsFeed.getBrandsFeed()
    console.log(response)
    console.log('Response ', JSON.stringify(response, null, 2))

    ctx.body = response
    await next()
  } catch (e) {
    logger.error({
      middleware: 'GET-BRANDS',
      // tslint:disable-next-line:object-literal-sort-keys
      message: 'Error',
      error: formatError(e),
    })
    ctx.status = 500

    return
  }
}

