export const PIC_REVIEW_STATUS_ENUM = {
  REVIEWING: 0,
  PASS: 1,
  REJECT: 2,
} as const

export const PIC_REVIEW_STATUS_MAP: Record<number, string> = {
  0: '待审核',
  1: '通过',
  2: '拒绝',
}

export const PIC_REVIEW_STATUS_OPTIONS = Object.keys(PIC_REVIEW_STATUS_MAP).map((key) => {
  const value = Number(key)
  return {
    label: PIC_REVIEW_STATUS_MAP[value],
    value,
  }
})

export const PIC_REPORT_STATUS_ENUM = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
} as const

export const PIC_REPORT_STATUS_MAP: Record<number, string> = {
  0: '待处理',
  1: '举报成立',
  2: '举报驳回',
}

export const PIC_REPORT_STATUS_OPTIONS = Object.keys(PIC_REPORT_STATUS_MAP).map((key) => {
  const value = Number(key)
  return {
    label: PIC_REPORT_STATUS_MAP[value],
    value,
  }
})

export const PIC_AI_TASK_STATUS_ENUM = {
  PENDING: 0,
  RUNNING: 1,
  SUCCESS: 2,
  FAILED: 3,
} as const

export const PIC_AI_TASK_STATUS_MAP: Record<number, string> = {
  0: '待处理',
  1: '处理中',
  2: '成功',
  3: '失败',
}
