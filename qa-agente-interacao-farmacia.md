# Roteiro de Testes de Fluxos e Features do Agente de Interação com o App da Farmácia

Objetivo

- Testar de forma estruturada os fluxos-chave do agente de interações com o app da farmácia, validando como as ferramentas (tools) implementadas são orquestradas para buscar produtos, gerenciar carrinho, aplicar cupons, escolher entregas, realizar checkout, persistir carrinho entre sessões e lidar com cenários de erro. Cada bloco descreve: objetivo do fluxo, minha pergunta (entrada do usuário), provável resposta do agente (com uso esperado das ferramentas), próxima pergunta e provável resposta do agente, para testar consistência e robustez do flow e das features.

Fluxos e subfluxos

1. Fluxo: Busca de Produtos

- Objetivo do fluxo: validar busca por termos, filtros, ordenação e limites, bem como correção de termos e tratamento de resultados vazios.
- Minha Pergunta 1: Busque produtos contendo o termo 'Dipirona'.
- Possível Resposta do Agente 1: "Foram encontrados X produtos correspondentes ao termo 'Dipirona': [lista com IDs, nomes, preços, avaliações, imagem]. Deseja refinar por categoria ou filtrar por preço?"
- Minha Pergunta 2: Busque por categoria 'Analgésicos'.
- Possível Resposta do Agente 2: "Resultados filtrados por categoria Analgésicos: [lista com itens]".
- Minha Pergunta 3: Filtre a busca anterior por preço máximo de 6,00 €.
- Possível Resposta do Agente 3: "Filtrando por preço <= 6,00 €, aparecem Y itens: [lista]."
- Minha Pergunta 4: Filtre por avaliações mínimas de 4,0 estrelas.
- Possível Resposta do Agente 4: "Itens com rating >= 4.0: [lista filtrada]."
- Minha Pergunta 5: Busque por marca específica 'Bayer'.
- Possível Resposta do Agente 5: "Resultados para Bayer: [lista]."
- Minha Pergunta 6: Faça uma busca por termo mal digitado 'Dipirnona' e veja se o agente corrige para Dipirona.
- Possível Resposta do Agente 6: "Você quis dizer 'Dipirona'? Refazendo busca..."
- Minha Pergunta 7: Busque por termo que não deve retornar resultados: 'xyz-inexistente'.
- Possível Resposta do Agente 7: "Nenhum resultado encontrado para 'xyz-inexistente'."
- Minha Pergunta 8: Ordene os resultados da busca por preço crescente.
- Possível Resposta do Agente 8: "Resultados ordenados por preço (crescente): [lista]."
- Minha Pergunta 9: Peça para retornar apenas 5 primeiros itens da lista.
- Possível Resposta do Agente 9: "Top 5 itens: [lista com 5 itens]."

2. Fluxo: Criar Carrinho e Adicionar Itens

- Objetivo do fluxo: validar a criação de carrinho, adição de itens via IDs ou resultados de busca e validação de quantidades.
- Minha Pergunta 10: Inicie uma nova sessão de compra (criar carrinho) e adicione ao carrinho o produto com ID 101 na quantidade 2.
- Possível Resposta do Agente 10: "Carrinho criado; item 101 adicionado na qty 2. Subtotal: ..."
- Minha Pergunta 11: Procure pelo termo 'Paracetamol' e adicione o item da primeira posição da lista de resultados ao carrinho com quantidade 1.
- Possível Resposta do Agente 11: "Paracetamol (ID X) adicionado ao carrinho na qty 1."
- Minha Pergunta 12: Adicione ao carrinho o produto com ID 205 na quantidade 3.
- Possível Resposta do Agente 12: "Item 205 adicionado ao carrinho com qty 3."
- Minha Pergunta 13: Tente adicionar quantidade negativa (-1) de algum item e observe a validação.
- Possível Resposta do Agente 13: "Quantidade inválida. Utilize valores positivos."

3. Fluxo: Modificações de Carrinho

- Objetivo do fluxo: validar atualizações de quantidade, remoção automática quando qty<=0 e remoção explícita.
- Minha Pergunta 14: Atualize a quantidade do item com ID 101 para 4.
- Possível Resposta do Agente 14: "Item 101 qty atualizado para 4."
- Minha Pergunta 15: Atualize a quantidade do item com ID 205 para 0 (remover automaticamente) ou, se o sistema exigir remoção, remova-o.
- Possível Resposta do Agente 15: "Item 205 removido do carrinho."
- Minha Pergunta 16: Remova o item com ID 101 do carrinho.
- Possível Resposta do Agente 16: "Item 101 removido do carrinho."

4. Fluxo: Listagem e Resumo do Carrinho

- Objetivo do fluxo: validar exibição de resumo, total e conteúdo antes de cupons.
- Minha Pergunta 17: Exiba o resumo atual do carrinho com itens, quantidades e subtotal.
- Possível Resposta do Agente 17: "Resumo do carrinho: [itens, qty, subtotal]."
- Minha Pergunta 18: Mostre o total com imposto incluído.
- Possível Resposta do Agente 18: "Total com impostos: ... (inclui imposto de X%)."
- Minha Pergunta 19: Mostre o conteúdo do carrinho antes de aplicar cupons.
- Possível Resposta do Agente 19: "Conteúdo atual: [itens e quantidades]."

5. Fluxo: Cupom e Entrega

- Objetivo do fluxo: validar cupons, opções de entrega e pagamentos.
- Minha Pergunta 20: Aplique o cupom 'FARM10' (se disponível) e mostre o desconto aplicado.
- Possível Resposta do Agente 20: "Cupom FARM10 aplicado; desconto: ...; novo total: ..."
- Minha Pergunta 21: Selecione o método de entrega 'Envio Standard'.
- Possível Resposta do Agente 21: "Entrega selecionada: Envio Standard."
- Minha Pergunta 22: Mostre as opções de pagamento disponíveis para o checkout.
- Possível Resposta do Agente 22: "Pagamentos disponíveis: [cartão, transferência, dinheiro, etc.]."

6. Fluxo: Checkout e Finalização

- Objetivo do fluxo: validar a prosseguir, confirmar e finalizar pedido.
- Minha Pergunta 23: Prosseguir para checkout usando os dados do usuário atual.
- Possível Resposta do Agente 23: "Checkout iniciado; endereço: ..., método: ..."
- Minha Pergunta 24: Confirmar a compra com endereço de entrega cadastrado e método de entrega escolhido.
- Possível Resposta do Agente 24: "Pedido confirmado. Nº de pedido: ..."
- Minha Pergunta 25: Simule a conclusão do pedido e mostre o número de pedido.
- Possível Resposta do Agente 25: "Pedido concluído com sucesso. Nº: ..."

7. Fluxo: Persistência e Histórico

- Objetivo do fluxo: validar persistência entre sessões e disponibilidade de histórico.
- Minha Pergunta 26: Encerrar a sessão e iniciar novamente; o carrinho persiste ou é recriado?
- Possível Resposta do Agente 26: "Carrinho persiste entre sessões" ou "Novo carrinho criado."
- Minha Pergunta 27: Carregar carrinho salvo anteriormente (se houver) e listar itens.
- Possível Resposta do Agente 27: "Carrinho carregado: [itens]."
- Minha Pergunta 28: Verificar se o histórico de pedidos exibe o último pedido (quando aplicável).
- Possível Resposta do Agente 28: "Último pedido: [nº e status]."

8. Fluxo: Casos de Erro e Robustez

- Objetivo do fluxo: validar comportamento sob entradas inválidas, timeouts, estoque e falhas de atualização.
- Minha Pergunta 29: Buscar por termo com caracteres especiais ('acetaminofénico!').
- Possível Resposta do Agente 29: "Termo contém caracteres especiais; sugere correção ou retorna resultados limitados."
- Minha Pergunta 30: O servidor demorar para responder (timeout) durante a busca.
- Possível Resposta do Agente 30: "Tempo de resposta excedido; deseja tentar novamente?"
- Minha Pergunta 31: Como o agente lida com itens fora de estoque ao adicionar/atualizar.
- Possível Resposta do Agente 31: "Item fora de estoque; oferece substituto ou informa indisponibilidade."
- Minha Pergunta 32: O que acontece se uma atualização de carrinho falha no meio do fluxo.
- Possível Resposta do Agente 32: "Falha de atualização detectada; mantém estado consistente e oferece retry."
- Minha Pergunta 33: Selecione um item inexistente no carrinho (ID 9999) e tente atualizar.
- Possível Resposta do Agente 33: "Item não encontrado no carrinho; verifique o ID."

Dados de Teste (referência)

- Termos de busca comuns: Dipirona, Paracetamol, Ibuprofeno, Dipirona 500 mg, Analgésicos
- IDs simulados de itens para carrinho: 101, 205, 330
- Cupom de teste: FARM10 (quando disponível)
- Endereço de entrega: cadastrado no usuário de teste (quando aplicável)

Notas de Aceitação

- O agente deve retornar resultados esperados para cada fluxo, com listas de produtos, itens de carrinho, totais, descontos e status de operações.
- Mensagens de erro devem ser claras e orientar correções.
- Fluxos de persistência devem manter estado entre sessões conforme configuração atual do app.

Observações finais

- Use este roteiro como base para validação manual ou automatizada com as APIs/tools do app.
- Ajuste nomes de produtos e IDs conforme o ambiente de testes atual.
- Sinta-se à vontade para adaptar a nomenclatura das perguntas e as respostas esperadas conforme o comportamento observado no seu ambiente de testes.
