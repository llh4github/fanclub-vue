/**
 * Fanclub 配置接口
 * 用于存储主播相关的配置信息
 */
export interface FanclubConfig {
  /** 主播名称 */
  anchorName: string
  /** 出道日期 */
  debutDate: Date
  /** 生日 */
  birthday: Date
}
