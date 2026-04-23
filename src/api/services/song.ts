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
  bid?: number
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
 * 添加歌曲请求参数
 */
export interface AnchorSongAddInput {
  bid: number
  name: string
  price: number
  bv: string
}

/**
 * 更新歌曲请求参数
 */
export interface AnchorSongUpdateInput {
  id: number
  bid: number
  name: string
  price: number
  bv: string
}

/**
 * 删除歌曲请求参数
 */
export interface DeleteIds {
  ids: number[]
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

  /**
   * 添加歌曲
   */
  async addSong(data: AnchorSongAddInput): Promise<JsonWrapper<boolean>> {
    return apiClient.post<boolean>('/anchor/song/add', data)
  },

  /**
   * 更新歌曲
   */
  async updateSong(data: AnchorSongUpdateInput): Promise<JsonWrapper<void>> {
    return apiClient.put<void>('/anchor/song/update', data)
  },

  /**
   * 删除歌曲
   */
  async deleteSong(data: DeleteIds): Promise<JsonWrapper<number>> {
    return apiClient.delete<number>('/anchor/song/delete', data)
  },
}
