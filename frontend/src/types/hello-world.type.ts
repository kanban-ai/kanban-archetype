export interface HelloWorld {
  id: number;
  title: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHelloWorldDto {
  title: string;
  description?: string;
  active?: boolean;
}

export interface UpdateHelloWorldDto {
  title?: string;
  description?: string;
  active?: boolean;
}
