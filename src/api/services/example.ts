import { apiClient } from '../client';
import type { JsonWrapper } from '../types';

/**
 * 示例数据类型
 */
export interface ExampleData {
  id: number;
  name: string;
  description: string;
}

/**
 * 示例 API 服务
 */
export const exampleService = {
  /**
   * 获取示例数据列表
   */
  async getExamples(): Promise<JsonWrapper<ExampleData[]>> {
    return apiClient.get<ExampleData[]>('/examples');
  },

  /**
   * 获取单个示例数据
   */
  async getExample(id: number): Promise<JsonWrapper<ExampleData>> {
    return apiClient.get<ExampleData>(`/examples/${id}`);
  },

  /**
   * 创建示例数据
   */
  async createExample(data: Omit<ExampleData, 'id'>): Promise<JsonWrapper<ExampleData>> {
    return apiClient.post<ExampleData>('/examples', data);
  },

  /**
   * 更新示例数据
   */
  async updateExample(id: number, data: Partial<ExampleData>): Promise<JsonWrapper<ExampleData>> {
    return apiClient.put<ExampleData>(`/examples/${id}`, data);
  },

  /**
   * 删除示例数据
   */
  async deleteExample(id: number): Promise<JsonWrapper<void>> {
    return apiClient.delete<void>(`/examples/${id}`);
  },
};
