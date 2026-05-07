import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Switch from "../../components/form/switch/Switch";
import Label from "../../components/form/Label";
import { TrashBinIcon, PlusIcon, PencilIcon, CheckLineIcon, CloseLineIcon } from "../../icons";
import { todoService } from "../../services/todo.service";
import { getErrorMessage } from "../../services/api";
import type { Todo } from "../../types/todo.type";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  async function fetchTodos() {
    setLoading(true);
    setError(null);
    try {
      const data = await todoService.list();
      setTodos(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTodos();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const created = await todoService.create({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        active: true,
      });
      setTodos((prev) => [...prev, created]);
      setNewTitle("");
      setNewDescription("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(todo: Todo, checked: boolean) {
    try {
      const updated = await todoService.update(todo.id, { active: checked });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(id: number) {
    try {
      await todoService.remove(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function saveEdit(id: number) {
    if (!editTitle.trim()) return;
    try {
      const updated = await todoService.update(id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      cancelEdit();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageMeta
        title="TODO List | TailAdmin - React.js Admin Dashboard Template"
        description="Minimal TODO List example consuming the backend API"
      />
      <PageBreadcrumb pageTitle="TODO List" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            Add new TODO
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="todo-title">Title</Label>
              <Input
                id="todo-title"
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="todo-description">Description</Label>
              <Input
                id="todo-description"
                placeholder="Optional description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              startIcon={<PlusIcon className="size-4" />}
              disabled={creating || !newTitle.trim()}
            >
              {creating ? "Creating..." : "Add TODO"}
            </Button>
          </form>
        </div>

        {error && (
          <div className="rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              All TODOs
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {todos.length} item(s)
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
          ) : todos.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No TODOs yet. Add one above.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {todos.map((todo) => (
                <li key={todo.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  {editingId === todo.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                      />
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          todo.active
                            ? "text-gray-800 dark:text-white/90"
                            : "text-gray-400 line-through dark:text-gray-500"
                        }`}
                      >
                        {todo.title}
                      </p>
                      {todo.description && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {todo.description}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {editingId === todo.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          startIcon={<CheckLineIcon className="size-4" />}
                          onClick={() => saveEdit(todo.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          startIcon={<CloseLineIcon className="size-4" />}
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Switch
                          defaultChecked={todo.active}
                          onChange={(checked) => handleToggleActive(todo, checked)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          startIcon={<PencilIcon className="size-4" />}
                          onClick={() => startEdit(todo)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          startIcon={<TrashBinIcon className="size-4" />}
                          onClick={() => handleDelete(todo.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
