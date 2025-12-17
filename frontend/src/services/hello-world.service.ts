import api from './api';
import type { HelloWorld, CreateHelloWorldDto, UpdateHelloWorldDto } from '../types';

const ENDPOINT = '/v1/hello-world';

export const helloWorldService = {
  async getAll(): Promise<HelloWorld[]> {
    const response = await api.get<HelloWorld[]>(ENDPOINT);
    return response.data;
  },

  async getById(id: number): Promise<HelloWorld> {
    const response = await api.get<HelloWorld>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  async create(data: CreateHelloWorldDto): Promise<HelloWorld> {
    const response = await api.post<HelloWorld>(ENDPOINT, data);
    return response.data;
  },

  async update(id: number, data: UpdateHelloWorldDto): Promise<HelloWorld> {
    const response = await api.patch<HelloWorld>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
