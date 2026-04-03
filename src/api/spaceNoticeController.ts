// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addSpaceNotice POST /api/spaceNotice/add */
export async function addSpaceNoticeUsingPost(
  body: API.SpaceNoticeAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>('/api/spaceNotice/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** editSpaceNotice POST /api/spaceNotice/edit */
export async function editSpaceNoticeUsingPost(
  body: API.SpaceNoticeEditRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/spaceNotice/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** deleteSpaceNotice POST /api/spaceNotice/delete */
export async function deleteSpaceNoticeUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/spaceNotice/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listSpaceNotice POST /api/spaceNotice/list */
export async function listSpaceNoticeUsingPost(
  body: API.SpaceNoticeQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListSpaceNoticeVO_>('/api/spaceNotice/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
