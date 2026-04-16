import { apiClient } from '../client'
import type { JsonWrapper } from '../types'

/**
 * 分页查询请求参数
 */
export interface PageQueryRequest {
  pageIndex: number
  pageSize: number
}

/**
 * 歌曲查询参数
 */
export interface AnchorSongQuerySpec {
  name?: string
  pageParam: PageQueryRequest
}

/**
 * 歌曲页面视图
 */
export interface AnchorSongPageView {
  id: number
  createdTime: string
  updatedTime: string
  bid: number
  name: string
  price: number
  bv: string
}

/**
 * 分页响应
 */
export interface PageResponseAnchorSongPageView {
  totalRowCount: number
  totalPage: number
  records: AnchorSongPageView[]
}

/**
 * 歌曲服务
 */
export const songService = {
  /**
   * 分页查询歌曲
   */
  async getSongPage(
    data: AnchorSongQuerySpec,
  ): Promise<JsonWrapper<PageResponseAnchorSongPageView>> {
    return apiClient.post<PageResponseAnchorSongPageView>('/anchor/song/page', data)
  },

  /**
   * liko专用分页查询
   */
  async getSongPageLiko(
    data: AnchorSongQuerySpec,
  ): Promise<JsonWrapper<PageResponseAnchorSongPageView>> {
    return apiClient.post<PageResponseAnchorSongPageView>('/anchor/song/page/liko', data)
  },

  /**
   * 根据 ID 获取歌曲
   */
  async getSongById(id: number): Promise<JsonWrapper<AnchorSongPageView>> {
    return apiClient.get<AnchorSongPageView>(`/anchor/song?id=${id}`)
  },
}
