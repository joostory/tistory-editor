import dayjs from 'dayjs'

export const makeUrlBase = (content: string | null | undefined): string => {
  if (!content) {
    return ''
  }
  return content.replace(/(['"])\/\//, '$1https://')
}

export const unixtimstampToDate = (timestamp?: string | number | null): string => {
  try {
    const date = timestamp ? new Date(typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp) : new Date()
    return dayjs(date).format('YYYY-MM-DD')
  } catch (e) {
    console.error(timestamp, e)
    return ''
  }
}

export const timestampsToDate = (timestamps?: string | number | Date | null): string => {
  try {
    const date = timestamps ? new Date(timestamps as any) : new Date()
    return dayjs(date).format('YYYY-MM-DD')
  } catch (e) {
    console.error(timestamps, e)
    return ''
  }
}
