import { api } from "./api";
import type { CreateTodoDto, Todo, UpdateTodoDto } from "../types/todo.type";

const RESOURCE = "/v1/hello-world";

export const todoService = {
  async list(): Promise<Todo[]> {
    const { data } = await api.get<Todo[]>(RESOURCE);
    return data;
  },

  async create(payload: CreateTodoDto): Promise<Todo> {
    const { data } = await api.post<Todo>(RESOURCE, payload);
    return data;
  },

  async update(id: number, payload: UpdateTodoDto): Promise<Todo> {
    const { data } = await api.patch<Todo>(`${RESOURCE}/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`${RESOURCE}/${id}`);
  },
};
