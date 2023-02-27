import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import type { CreateSchedulerParams, SchedulerBody } from '../typings/scheduler'

const appId = process.env.VTEX_APP_ID
const [runningAppName] = appId ? appId.split('@') : ['']

export default class SchedulerClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    const { account, workspace } = context

    super(
      `http://${account}.myvtex.com/api/scheduler/${workspace}/${runningAppName}`,
      context,
      {
        ...options,
        headers: {
          ...options?.headers,
          'Content-Type': 'application/json',
          'X-Vtex-Use-Https': 'true',
          VtexIdclientAutCookie: context.authToken,
        },
        params: {
          version: '4',
        },
      }
    )
  }

  public async createOrUpdateScheduler({
    cronExpression,
    cronRequestURI,
    cronRequestMethod,
    cronBody,
    cronId,
  }: CreateSchedulerParams) {
    const schedulerBody: SchedulerBody = {
      id: cronId,
      scheduler: {
        expression: cronExpression,
        endDate: '2100-01-01T23:30:00',
      },
      request: {
        uri: cronRequestURI,
        method: cronRequestMethod,
        body: cronBody,
        headers: {
          'cache-control': 'no-cache, no-store',
        },
      },
      retry: {
        delay: {
          addMinutes: 1,
          addHours: 0,
          addDays: 0,
        },
        times: 6,
        backOffRate: 1.0,
      },
    }

    return this.http.put('', schedulerBody)
  }

  public async deleteScheduler(id: string) {
    return this.http.delete(`/${id}`)
  }

  public async getScheduler(id: string) {
    return this.http.get(`/${id}`)
  }
}
