import type { InstanceOptions, IOContext, IOResponse } from '@vtex/api'
import { IOClient } from '@vtex/api'

export default class FileDownloader extends IOClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
      headers: {
        ...options?.headers,
        'X-Vtex-Use-Https': 'true',
        'Proxy-Authorization': context.authToken,
      },
    })
  }

  public async getFile(path: string): Promise<IOResponse<ArrayBuffer>> {
    return this.http.getRaw<ArrayBuffer>(path, {
      responseType: 'arraybuffer',
    })
  }
}
