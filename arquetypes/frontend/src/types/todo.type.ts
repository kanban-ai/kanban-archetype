export interface Todo {
  id: number;
  title: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  active?: boolean;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  active?: boolean;
}
