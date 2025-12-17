import { useHelloWorld } from '../context';
import { HelloWorldCard, HelloWorldForm } from '../components';

export function HelloWorldPage() {
  const {
    items,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    clearError,
  } = useHelloWorld();

  const handleDelete = (id: number) => {
    if (!confirm('Deseja excluir este item?')) return;
    deleteItem(id);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hello World CRUD</h1>
          <p className="text-gray-600 mt-2">
            Exemplo de página consumindo a API Hello World
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button onClick={clearError} className="ml-4 text-red-900 font-bold">
              X
            </button>
          </div>
        )}

        <HelloWorldForm onSubmit={createItem} isLoading={isLoading} />

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-600">Nenhum item encontrado. Crie um acima!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <HelloWorldCard
                key={item.id}
                item={item}
                onEdit={updateItem}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>API Endpoint: /api/v1/hello-world</p>
          <p>Swagger Docs: /api/docs</p>
        </footer>
      </div>
    </div>
  );
}
