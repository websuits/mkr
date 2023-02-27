/* eslint-disable no-restricted-syntax */
export interface SchedulerBody {
  id?: string
  scheduler: {
    expression: string
    endDate: string
  }
  request: {
    uri: string
    method: string
    body: any
    headers: any
  }
  retry?: {
    delay: {
      addMinutes: number
      addHours: number
      addDays: number
    }
    times: number
    backOffRate: number
  }
}

export enum SchedulerRequestMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
}

export interface CreateSchedulerParams {
  cronExpression: string
  cronRequestURI: string
  cronRequestMethod: string
  cronBody: any
  cronHeaders: any
  cronId?: string
}
