// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** health GET /api/health */
export async function healthUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseString_>('/api/health', {
    method: 'GET',
    ...(options || {}),
  })
}

/** isLogin GET /api/isLogin */
export async function isLoginUsingGet(options?: { [key: string]: any }) {
  return request<string>('/api/isLogin', {
    method: 'GET',
    ...(options || {}),
  })
}

/** doLogin POST /api/login */
export async function doLoginUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.doLoginUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<string>('/api/login', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** logout GET /api/logout */
export async function logoutUsingGet(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/logout', {
    method: 'GET',
    ...(options || {}),
  })
}

/** tokenInfo GET /api/tokenInfo */
export async function tokenInfoUsingGet(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/tokenInfo', {
    method: 'GET',
    ...(options || {}),
  })
}
