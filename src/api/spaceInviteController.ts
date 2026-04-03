// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addSpaceInvite POST /api/spaceInvite/add */
export async function addSpaceInviteUsingPost(
  body: API.SpaceInviteAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>('/api/spaceInvite/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** acceptSpaceInvite POST /api/spaceInvite/accept */
export async function acceptSpaceInviteUsingPost(
  body: API.SpaceInviteHandleRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/spaceInvite/accept', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** rejectSpaceInvite POST /api/spaceInvite/reject */
export async function rejectSpaceInviteUsingPost(
  body: API.SpaceInviteHandleRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/spaceInvite/reject', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listSpaceInviteByPage POST /api/spaceInvite/list/page */
export async function listSpaceInviteByPageUsingPost(
  body: API.SpaceInviteQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageSpaceInviteVO_>('/api/spaceInvite/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listMySpaceInviteByPage POST /api/spaceInvite/list/my */
export async function listMySpaceInviteByPageUsingPost(
  body: API.SpaceInviteQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageSpaceInviteVO_>('/api/spaceInvite/list/my', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
