/** 主播信息 */
export interface AnchorInfo {
  /** 主播名称 */
  name: string;
  /** 生日 */
  birthday: Date;
  /** 出道日期 */
  debutDate: Date;
  /** 直播间ID */
  roomId: number;
  /** B站的UID */
  uid: number;
}
/** 莉蔻Liko 主播信息 */
export const LIKO_INFO = {
  name: "莉蔻Liko",
  birthday: new Date(2026, 8, 3),
  debutDate: new Date(2026, 1, 14),
  roomId: 1713548468,
  uid: 1536601294,
} as AnchorInfo;
