/**
 * Testes E2E para o CRUD do Hello World
 *
 * Cobre todas as operacoes CRUD:
 * - CREATE: Criar novo item
 * - READ: Listar e visualizar itens
 * - UPDATE: Editar item existente
 * - DELETE: Excluir item
 */
import { test, expect, FRONTEND_URL, API_URL } from '../fixtures/test.fixture';

// Helper para gerar dados unicos por teste
const generateTestData = (prefix: string) => ({
  title: `${prefix} - ${Date.now()}`,
  description: `Descricao do teste ${prefix}`,
});

// Helper para limpar itens criados durante o teste via API
async function cleanupTestItems(page: import('@playwright/test').Page, itemIds: number[]) {
  for (const id of itemIds) {
    try {
      await page.request.delete(`${API_URL}/v1/hello-world/${id}`);
    } catch {
      // Ignora erros de limpeza
    }
  }
}

// Helper para criar item via API (para setup de testes)
async function createItemViaApi(
  page: import('@playwright/test').Page,
  data: { title: string; description?: string }
): Promise<number> {
  const response = await page.request.post(`${API_URL}/v1/hello-world`, {
    data,
  });
  const item = await response.json();
  return item.id;
}

test.describe('Hello World CRUD', () => {
  test.describe('CREATE - Criar novo item', () => {
    test('deve criar um item com titulo e descricao', async ({ testPage }) => {
      const testData = generateTestData('Create Test 1');
      const createdIds: number[] = [];

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Preencher formulario
      await testPage.fill('input[placeholder="Title *"]', testData.title);
      await testPage.fill('textarea[placeholder="Description (optional)"]', testData.description);

      // Submeter formulario
      await testPage.click('button[type="submit"]');

      // Verificar que o item aparece na lista
      const card = testPage.locator('.bg-white.border').filter({ hasText: testData.title });
      await expect(card).toBeVisible({ timeout: 10000 });
      await expect(card.locator('p').first()).toContainText(testData.description);

      // Capturar ID para limpeza (via API response interceptada)
      // Como nao temos acesso direto ao ID, vamos buscar via API
      const response = await testPage.request.get(`${API_URL}/v1/hello-world`);
      const items = await response.json();
      const createdItem = items.find((item: { title: string }) => item.title === testData.title);
      if (createdItem) {
        createdIds.push(createdItem.id);
      }

      // Cleanup
      await cleanupTestItems(testPage, createdIds);
    });

    test('deve criar um item apenas com titulo (descricao opcional)', async ({ testPage }) => {
      const testData = generateTestData('Create Test 2');
      const createdIds: number[] = [];

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Preencher apenas titulo
      await testPage.fill('input[placeholder="Title *"]', testData.title);

      // Submeter formulario
      await testPage.click('button[type="submit"]');

      // Verificar que o item aparece na lista
      const card = testPage.locator('.bg-white.border').filter({ hasText: testData.title });
      await expect(card).toBeVisible({ timeout: 10000 });
      await expect(card).toContainText('No description');

      // Cleanup
      const response = await testPage.request.get(`${API_URL}/v1/hello-world`);
      const items = await response.json();
      const createdItem = items.find((item: { title: string }) => item.title === testData.title);
      if (createdItem) {
        createdIds.push(createdItem.id);
        await cleanupTestItems(testPage, createdIds);
      }
    });

    test('deve limpar o formulario apos criar item', async ({ testPage }) => {
      const testData = generateTestData('Create Test 3');
      const createdIds: number[] = [];

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Preencher formulario
      await testPage.fill('input[placeholder="Title *"]', testData.title);
      await testPage.fill('textarea[placeholder="Description (optional)"]', testData.description);

      // Submeter formulario
      await testPage.click('button[type="submit"]');

      // Aguardar criacao
      await expect(testPage.locator('.bg-white.border').filter({ hasText: testData.title })).toBeVisible({ timeout: 10000 });

      // Verificar que campos foram limpos
      await expect(testPage.locator('input[placeholder="Title *"]')).toHaveValue('');
      await expect(testPage.locator('textarea[placeholder="Description (optional)"]')).toHaveValue('');

      // Cleanup
      const response = await testPage.request.get(`${API_URL}/v1/hello-world`);
      const items = await response.json();
      const createdItem = items.find((item: { title: string }) => item.title === testData.title);
      if (createdItem) {
        createdIds.push(createdItem.id);
        await cleanupTestItems(testPage, createdIds);
      }
    });

    test('nao deve permitir criar item sem titulo', async ({ testPage }) => {
      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Verificar que botao esta desabilitado sem titulo
      const submitButton = testPage.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();

      // Preencher apenas descricao
      await testPage.fill('textarea[placeholder="Description (optional)"]', 'Descricao sem titulo');

      // Botao ainda deve estar desabilitado
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('READ - Listar e visualizar itens', () => {
    test('deve exibir mensagem quando nao ha itens', async ({ testPage }) => {
      // Primeiro, limpar todos os itens via API
      const response = await testPage.request.get(`${API_URL}/v1/hello-world`);
      const items = await response.json();
      for (const item of items) {
        await testPage.request.delete(`${API_URL}/v1/hello-world/${item.id}`);
      }

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Verificar mensagem de lista vazia
      await expect(testPage.locator('text=Nenhum item encontrado')).toBeVisible();
    });

    test('deve exibir lista de itens existentes', async ({ testPage }) => {
      const testData1 = generateTestData('Read Test 1');
      const testData2 = generateTestData('Read Test 2');
      const createdIds: number[] = [];

      // Criar itens via API
      const id1 = await createItemViaApi(testPage, testData1);
      const id2 = await createItemViaApi(testPage, testData2);
      createdIds.push(id1, id2);

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Verificar que os itens aparecem
      await expect(testPage.locator('.bg-white.border').filter({ hasText: testData1.title })).toBeVisible();
      await expect(testPage.locator('.bg-white.border').filter({ hasText: testData2.title })).toBeVisible();

      // Cleanup
      await cleanupTestItems(testPage, createdIds);
    });

    test('deve exibir dados corretos do item (titulo, descricao, status)', async ({ testPage }) => {
      const testData = generateTestData('Read Test 3');
      const createdIds: number[] = [];

      // Criar item via API
      const id = await createItemViaApi(testPage, testData);
      createdIds.push(id);

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Localizar card do item
      const card = testPage.locator('.bg-white.border').filter({ hasText: testData.title });

      // Verificar titulo
      await expect(card.locator('h3')).toContainText(testData.title);

      // Verificar descricao
      await expect(card.locator('p').first()).toContainText(testData.description);

      // Verificar status Active (padrao)
      await expect(card.locator('span.rounded-full')).toContainText('Active');

      // Verificar data de criacao
      await expect(card).toContainText('Created:');

      // Cleanup
      await cleanupTestItems(testPage, createdIds);
    });

    test('deve exibir itens ordenados por data de criacao (mais recente primeiro)', async ({ testPage }) => {
      const testData1 = generateTestData('Read Order 1');
      const testData2 = generateTestData('Read Order 2');
      const createdIds: number[] = [];

      // Criar primeiro item
      const id1 = await createItemViaApi(testPage, testData1);
      createdIds.push(id1);

      // Aguardar um momento para garantir diferenca de timestamp
      await testPage.waitForTimeout(100);

      // Criar segundo item
      const id2 = await createItemViaApi(testPage, testData2);
      createdIds.push(id2);

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Verificar ordem (mais recente primeiro)
      const cards = testPage.locator('.bg-white.border');
      const firstCardText = await cards.first().textContent();

      // O segundo item criado deve aparecer primeiro
      expect(firstCardText).toContain(testData2.title);

      // Cleanup
      await cleanupTestItems(testPage, createdIds);
    });
  });

  test.describe('UPDATE - Editar item existente', () => {
    test('deve abrir modo de edicao ao clicar em Edit', async ({ testPage }) => {
      const testData = generateTestData('Update Test 1');
      const createdIds: number[] = [];

      // Criar item via API
      const id = await createItemViaApi(testPage, testData);
      createdIds.push(id);

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Localizar card (primeiro da lista pois é o mais recente)
      const card = testPage.locator('.bg-white.border').first();
      await expect(card).toContainText(testData.title);
      await card.locator('button:has-text("Edit")').click();

      // Verificar que modo de edicao foi ativado
      await expect(card.locator('input[placeholder="Title"]')).toBeVisible();
      await expect(card.locator('textarea[placeholder="Description"]')).toBeVisible();
      await expect(card.locator('button:has-text("Save")')).toBeVisible();
      await expect(card.locator('button:has-text("Cancel")')).toBeVisible();

      // Cleanup
      await cleanupTestItems(testPage, createdIds);
    });

    test('deve atualizar titulo do item', async ({ testPage }) => {
      const testData = generateTestData('Update Test 2');
      const newTitle = `Updated Title - ${Date.now()}`;
      const createdIds: number[] = [];

      // Criar item via API
      const id = await createItemViaApi(testPage, testData);
      createdIds.push(id);

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Localizar card (primeiro da lista pois é o mais recente)
      const card = testPage.locator('.bg-white.border').first();
      await expect(card).toContainText(testData.title);
      await card.locator('button:has-text("Edit")').click();

      // Aguardar modo de edicao
      await expect(card.locator('input[placeholder="Title"]')).toBeVisible();

      // Limpar e preencher novo titulo
      await card.locator('input[placeholder="Title"]').clear();
      await card.locator('input[placeholder="Title"]').fill(newTitle);

      // Salvar
      await card.locator('button:has-text("Save")').click();

      // Verificar que titulo foi atualizado
      await expect(card.locator('h3')).toContainText(newTitle, { timeout: 10000 });

      // Cleanup
      await cleanupTestItems(testPage, createdIds);
    });

    test('deve atualizar descricao do item', async ({ testPage }) => {
      const testData = generateTestData('Update Test 3');
      const newDescription = `Updated Description - ${Date.now()}`;
      const createdIds: number[] = [];

      // Criar item via API
      const id = await createItemViaApi(testPage, testData);
      createdIds.push(id);

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Localizar card (primeiro da lista pois é o mais recente)
      const card = testPage.locator('.bg-white.border').first();
      await expect(card).toContainText(testData.title);
      await card.locator('button:has-text("Edit")').click();

      // Aguardar modo de edicao
      await expect(card.locator('textarea[placeholder="Description"]')).toBeVisible();

      // Limpar e preencher nova descricao
      await card.locator('textarea[placeholder="Description"]').clear();
      await card.locator('textarea[placeholder="Description"]').fill(newDescription);

      // Salvar
      await card.locator('button:has-text("Save")').click();

      // Verificar que descricao foi atualizada
      await expect(card.locator('p').first()).toContainText(newDescription, { timeout: 10000 });

      // Cleanup
      await cleanupTestItems(testPage, createdIds);
    });

    test('deve cancelar edicao sem salvar alteracoes', async ({ testPage }) => {
      const testData = generateTestData('Update Test 4');
      const createdIds: number[] = [];

      // Criar item via API
      const id = await createItemViaApi(testPage, testData);
      createdIds.push(id);

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Localizar card (primeiro da lista pois é o mais recente)
      const card = testPage.locator('.bg-white.border').first();
      await expect(card).toContainText(testData.title);
      await card.locator('button:has-text("Edit")').click();

      // Aguardar modo de edicao
      await expect(card.locator('input[placeholder="Title"]')).toBeVisible();

      // Alterar titulo
      await card.locator('input[placeholder="Title"]').clear();
      await card.locator('input[placeholder="Title"]').fill('Titulo que nao sera salvo');

      // Cancelar
      await card.locator('button:has-text("Cancel")').click();

      // Verificar que titulo original foi mantido
      await expect(card.locator('h3')).toContainText(testData.title);

      // Cleanup
      await cleanupTestItems(testPage, createdIds);
    });

    test('deve atualizar titulo e descricao simultaneamente', async ({ testPage }) => {
      const testData = generateTestData('Update Test 5');
      const newTitle = `New Title - ${Date.now()}`;
      const newDescription = `New Description - ${Date.now()}`;
      const createdIds: number[] = [];

      // Criar item via API
      const id = await createItemViaApi(testPage, testData);
      createdIds.push(id);

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Localizar card (primeiro da lista pois é o mais recente)
      const card = testPage.locator('.bg-white.border').first();
      await expect(card).toContainText(testData.title);
      await card.locator('button:has-text("Edit")').click();

      // Aguardar modo de edicao
      await expect(card.locator('input[placeholder="Title"]')).toBeVisible();

      // Atualizar ambos os campos
      await card.locator('input[placeholder="Title"]').clear();
      await card.locator('input[placeholder="Title"]').fill(newTitle);
      await card.locator('textarea[placeholder="Description"]').clear();
      await card.locator('textarea[placeholder="Description"]').fill(newDescription);

      // Salvar
      await card.locator('button:has-text("Save")').click();

      // Verificar que ambos foram atualizados
      await expect(card.locator('h3')).toContainText(newTitle, { timeout: 10000 });
      await expect(card.locator('p').first()).toContainText(newDescription);

      // Cleanup
      await cleanupTestItems(testPage, createdIds);
    });
  });

  test.describe('DELETE - Excluir item', () => {
    test('deve exibir confirmacao antes de excluir', async ({ testPage }) => {
      const testData = generateTestData('Delete Test 1');
      const createdIds: number[] = [];

      // Criar item via API
      const id = await createItemViaApi(testPage, testData);
      createdIds.push(id);

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Configurar handler para dialog de confirmacao
      let dialogMessage = '';
      testPage.on('dialog', async (dialog) => {
        dialogMessage = dialog.message();
        await dialog.dismiss(); // Cancelar exclusao
      });

      // Localizar card e clicar em Delete
      const card = testPage.locator('.bg-white.border').filter({ hasText: testData.title });
      await card.locator('button:has-text("Delete")').click();

      // Verificar que dialog foi exibido
      expect(dialogMessage).toContain('Deseja excluir este item?');

      // Item ainda deve existir (cancelamos)
      await expect(card).toBeVisible();

      // Cleanup
      await cleanupTestItems(testPage, createdIds);
    });

    test('deve excluir item ao confirmar', async ({ testPage }) => {
      const testData = generateTestData('Delete Test 2');
      const createdIds: number[] = [];

      // Criar item via API
      const id = await createItemViaApi(testPage, testData);
      createdIds.push(id);

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Configurar handler para aceitar dialog
      testPage.on('dialog', async (dialog) => {
        await dialog.accept();
      });

      // Localizar card e clicar em Delete
      const card = testPage.locator('.bg-white.border').filter({ hasText: testData.title });
      await card.locator('button:has-text("Delete")').click();

      // Verificar que item foi removido da lista
      await expect(card).not.toBeVisible({ timeout: 10000 });

      // Verificar via API que item foi excluido (soft delete)
      const response = await testPage.request.get(`${API_URL}/v1/hello-world`);
      const items = await response.json();
      const deletedItem = items.find((item: { title: string }) => item.title === testData.title);
      expect(deletedItem).toBeUndefined();

      // Nao precisa cleanup - ja foi excluido
    });

    test('deve manter item ao cancelar exclusao', async ({ testPage }) => {
      const testData = generateTestData('Delete Test 3');
      const createdIds: number[] = [];

      // Criar item via API
      const id = await createItemViaApi(testPage, testData);
      createdIds.push(id);

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Configurar handler para rejeitar dialog
      testPage.on('dialog', async (dialog) => {
        await dialog.dismiss();
      });

      // Localizar card e clicar em Delete
      const card = testPage.locator('.bg-white.border').filter({ hasText: testData.title });
      await card.locator('button:has-text("Delete")').click();

      // Item ainda deve existir
      await expect(card).toBeVisible();

      // Verificar via API
      const response = await testPage.request.get(`${API_URL}/v1/hello-world`);
      const items = await response.json();
      const existingItem = items.find((item: { title: string }) => item.title === testData.title);
      expect(existingItem).toBeDefined();

      // Cleanup
      await cleanupTestItems(testPage, createdIds);
    });

    test('deve poder excluir multiplos itens sequencialmente', async ({ testPage }) => {
      const testData1 = generateTestData('Delete Multi 1');
      const testData2 = generateTestData('Delete Multi 2');
      const createdIds: number[] = [];

      // Criar itens via API
      const id1 = await createItemViaApi(testPage, testData1);
      const id2 = await createItemViaApi(testPage, testData2);
      createdIds.push(id1, id2);

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // Configurar handler para aceitar dialogs
      testPage.on('dialog', async (dialog) => {
        await dialog.accept();
      });

      // Excluir primeiro item
      const card1 = testPage.locator('.bg-white.border').filter({ hasText: testData1.title });
      await card1.locator('button:has-text("Delete")').click();
      await expect(card1).not.toBeVisible({ timeout: 10000 });

      // Excluir segundo item
      const card2 = testPage.locator('.bg-white.border').filter({ hasText: testData2.title });
      await card2.locator('button:has-text("Delete")').click();
      await expect(card2).not.toBeVisible({ timeout: 10000 });

      // Verificar que ambos foram excluidos
      const response = await testPage.request.get(`${API_URL}/v1/hello-world`);
      const items = await response.json();
      const item1 = items.find((item: { title: string }) => item.title === testData1.title);
      const item2 = items.find((item: { title: string }) => item.title === testData2.title);
      expect(item1).toBeUndefined();
      expect(item2).toBeUndefined();
    });
  });

  test.describe('Fluxo completo - CRUD integrado', () => {
    test('deve executar fluxo completo: criar, visualizar, editar e excluir', async ({ testPage }) => {
      const initialTitle = `CRUD Flow - ${Date.now()}`;
      const initialDescription = 'Descricao inicial do fluxo CRUD';
      const updatedTitle = `CRUD Flow Updated - ${Date.now()}`;
      const updatedDescription = 'Descricao atualizada do fluxo CRUD';

      await testPage.goto(`${FRONTEND_URL}/hello-world`);
      await testPage.waitForLoadState('networkidle');

      // 1. CREATE - Criar novo item
      await testPage.fill('input[placeholder="Title *"]', initialTitle);
      await testPage.fill('textarea[placeholder="Description (optional)"]', initialDescription);
      await testPage.click('button[type="submit"]');

      // Verificar criacao - usar first() pois é o mais recente
      const card = testPage.locator('.bg-white.border').first();
      await expect(card).toContainText(initialTitle, { timeout: 10000 });

      // 2. READ - Verificar dados exibidos
      await expect(card.locator('h3')).toContainText(initialTitle);
      await expect(card.locator('p').first()).toContainText(initialDescription);
      await expect(card.locator('span.rounded-full')).toContainText('Active');

      // 3. UPDATE - Editar item
      await card.locator('button:has-text("Edit")').click();

      // Aguardar modo de edicao
      await expect(card.locator('input[placeholder="Title"]')).toBeVisible();

      await card.locator('input[placeholder="Title"]').clear();
      await card.locator('input[placeholder="Title"]').fill(updatedTitle);
      await card.locator('textarea[placeholder="Description"]').clear();
      await card.locator('textarea[placeholder="Description"]').fill(updatedDescription);
      await card.locator('button:has-text("Save")').click();

      // Verificar atualizacao
      await expect(card.locator('h3')).toContainText(updatedTitle, { timeout: 10000 });
      await expect(card.locator('p').first()).toContainText(updatedDescription);

      // 4. DELETE - Excluir item
      testPage.on('dialog', async (dialog) => {
        await dialog.accept();
      });

      await card.locator('button:has-text("Delete")').click();

      // Verificar exclusao - nenhum card deve conter o titulo atualizado
      await expect(testPage.locator('.bg-white.border').filter({ hasText: updatedTitle })).toHaveCount(0, { timeout: 10000 });

      // Verificar via API
      const response = await testPage.request.get(`${API_URL}/v1/hello-world`);
      const items = await response.json();
      const deletedItem = items.find((item: { title: string }) => item.title === updatedTitle);
      expect(deletedItem).toBeUndefined();
    });
  });
});
