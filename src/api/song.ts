import { get, post, put, del } from "./request"
import type { JsonResp, PageResult } from "./types"

export interface AnchorSongSimple {
  bv: string
  name: string
  price: number
}

export interface AnchorSong extends AnchorSongSimple {
  id: string
  bid: number
  created_time: string
  updated_time: string
}

export interface GetSongPageParams {
  bid: number
  name?: string
  pageSize?: number
  pageIndex?: number
}

export interface CreateSongParams {
  bid: number
  name: string
  bv?: string
  price: number
}

export interface UpdateSongParams {
  id: string
  bid: number
  name: string
  bv?: string
  price?: number
}

export async function getSongPage(
  params: GetSongPageParams,
): Promise<JsonResp<PageResult<AnchorSongSimple>>> {
  const query = new URLSearchParams()
  query.append("bid", String(params.bid))
  if (params.name) query.append("name", params.name)
  if (params.pageSize) query.append("page_size", String(params.pageSize))
  if (params.pageIndex) query.append("page_index", String(params.pageIndex))
  return get<PageResult<AnchorSongSimple>>(`/anchor/song/page?${query.toString()}`)
}

export async function getAdminSongPage(
  params: GetSongPageParams,
): Promise<JsonResp<PageResult<AnchorSong>>> {
  const query = new URLSearchParams()
  query.append("bid", String(params.bid))
  if (params.name) query.append("name", params.name)
  if (params.pageSize) query.append("page_size", String(params.pageSize))
  if (params.pageIndex) query.append("page_index", String(params.pageIndex))
  return get<PageResult<AnchorSong>>(`/anchor/song/admin/page?${query.toString()}`)
}

export async function createSong(params: CreateSongParams): Promise<JsonResp<AnchorSong>> {
  return post<AnchorSong>("/anchor/song/add", params)
}

export async function updateSong(params: UpdateSongParams): Promise<JsonResp<string>> {
  return put<string>("/anchor/song/update", params)
}

export async function deleteSong(ids: string[]): Promise<JsonResp<string>> {
  return del<string>("/anchor/song/delete", { ids })
}
