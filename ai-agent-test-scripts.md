# Test Scripts for AI Agent

This document provides a set of test scripts to verify the functionality of the AI agent's tools.

**Note:** These scripts assume a logged-in user for cart and checkout functionalities.

---

### 1. Product Discovery

**1.1. Search for a product**
*   `User`: "Procuro por um remédio para dor de cabeça"
*   `Agent should`: Use `search_products` and return a list of products.

**1.2. List recommended products for a symptom**
*   `User`: "O que você recomenda para gripe?"
*   `Agent should`: Use `list_recommended_products` and return a list of relevant products.

**1.3. List promotional products**
*   `User`: "Quais são os produtos em promoção?"
*   `Agent should`: Use `get_promotional_products` and return a list of promotional products.

**1.4. List all categories**
*   `User`: "Quais as categorias de produtos que vocês têm?"
*   `Agent should`: Use `list_categories` and return a list of all available categories.

**1.5. Get product details**
*   `User`: "Me dê mais detalhes sobre o produto com ID '123'"
*   `Agent should`: Use `get_product_details` and return the product's information.

**1.6. Redirect to a product page**
*   `User`: "Me leve para a página do produto 'Dipirona'"
*   `Agent should`: Use `redirect_to_product` and redirect the user to the product's page.

---

### 2. Cart Management

**2.1. Add a product to the cart**
*   `User`: "Adicione 2 unidades do produto com ID '123' ao meu carrinho"
*   `Agent should`: Use `add_to_cart` and confirm the product has been added.

**2.2. View cart**
*   `User`: "O que tem no meu carrinho?"
*   `Agent should`: Use `view_cart` and show the cart's content.

**2.3. Update product quantity**
*   `User`: "Mude a quantidade do produto com ID '123' para 3"
*   `Agent should`: Use `update_cart_quantity` and confirm the change.

**2.4. Remove a product from the cart**
*   `User`: "Remova o produto com ID '123' do meu carrinho"
*   `Agent should`: Use `remove_from_cart` and confirm the removal.

**2.5. Clear cart**
*   `User`: "Limpe o meu carrinho"
*   `Agent should`: Use `clear_cart` and confirm the cart is empty.

**2.6. Redirect to the cart page**
*   `User`: "Me leve para o meu carrinho"
*   `Agent should`: Use `redirect_to_cart` and redirect the user to the cart page.

---

### 3. Budget and Savings

**3.1. Suggest products within a budget**
*   `User`: "Me mostre produtos de até 20 reais"
*   `Agent should`: Use `suggest_within_budget` and return a list of products within the specified budget.

**3.2. Optimize cart for a budget**
*   `User`: "Otimize meu carrinho para um orçamento de 50 reais"
*   `Agent should`: Use `optimize_cart_for_budget` and suggest changes to the cart.

**3.3. Compare prices of similar products**
*   `User`: "Compare os preços de analgésicos"
*   `Agent should`: Use `compare_prices` and return a price comparison of similar products.

**3.4. Compare price of a specific product**
*   `User`: "Compare o preço do produto com ID '123' com outros similares"
*   `Agent should`: Use `compare_product_prices` and return a price comparison.

---

### 4. Checkout

**4.1. Go to checkout**
*   `User`: "Quero finalizar minha compra"
*   `Agent should`: Use `go_to_checkout` and redirect the user to the checkout page.

**4.2. Apply discount code**
*   `User`: "Aplique o cupom 'PROMO10'"
*   `Agent should`: Use `apply_discount_code` and confirm the discount has been applied.

**4.3. Calculate shipping**
*   `User`: "Calcule o frete para o CEP 12345-678"
*   `Agent should`: Use `calculate_shipping` and return the shipping cost.

**4.4. Set payment method**
*   `User`: "Quero pagar com cartão de crédito em 2x"
*   `Agent should`: Use `set_payment_method` and confirm the payment method.

**4.5. Place order**
*   `User`: "Finalize o meu pedido"
*   `Agent should`: Use `place_order` and confirm the order has been placed.

---

### 5. Full Interaction Scenarios

**5.1. Scenario: Complete Purchase Flow**
*   `User`: "Olá, estou procurando um remédio para dor de cabeça, mas meu orçamento é de 20 reais."
*   `Agent should`: Suggest headache remedies within the R$20 budget.
*   `User`: "Qual a diferença entre a Neosaldina e a Dipirona?"
*   `Agent should`: Explain the difference between the two products.
*   `User`: "Pode adicionar a Neosaldina no meu carrinho?"
*   `Agent should`: Add Neosaldina to the cart and confirm.
*   `User`: "Eu também preciso de um protetor solar. Tem algum da La Roche-Posay?"
*   `Agent should`: List sunscreens from the brand La Roche-Posay.
*   `User`: "Adicione o Anthelios Airlicium no carrinho."
*   `Agent should`: Add the product to the cart and confirm.
*   `User`: "Qual o valor total do meu carrinho?"
*   `Agent should`: Provide the total amount for the items in the cart.
*   `User`: "Onde fica a loja de vocês?"
*   `Agent should`: Provide the store's location or information that it's an online-only store.
*   `User`: "Quero finalizar a compra."
*   `Agent should`: Redirect the user to the checkout page.

**5.2. Scenario: User is unsure and asks for recommendations**
*   `User`: "Não sei bem o que preciso, mas estou me sentindo indisposto e com o corpo mole. O que você sugere?"
*   `Agent should`: Ask clarifying questions or suggest general wellness products, maybe a vitamin C.
*   `User`: "Vitamina C parece uma boa. Qual a mais vendida?"
*   `Agent should`: List the best-selling Vitamin C products.
*   `User`: "Pode adicionar a da marca 'Redoxon' no carrinho."
*   `Agent should`: Add 'Redoxon' to the cart.
*   `User`: "Vocês entregam em todo o Brasil?"
*   `Agent should`: Provide information on delivery.
*   `User`: "Ok, por enquanto é só isso. Vou olhar mais coisas e volto depois."
*   `Agent should`: End the conversation gracefully, maybe suggesting to save the cart.

**5.3. Scenario: User has a problem and looks for a new product**
*   `User`: "Comprei um produto e veio errado. Como faço para trocar?"
*   `Agent should`: Provide instructions for exchange/returns, or guide to the correct page/contact.
*   `User`: "Preciso de um termômetro novo. Qual a diferença entre o digital e o infravermelho?"
*   `Agent should`: Explain the difference.
*   `User`: "O infravermelho é mais preciso?"
*   `Agent should`: Provide details on accuracy.
*   `User`: "Ok, vou querer o infravermelho. Adicione ao carrinho."
*   `Agent should`: Add it to the cart.
*   `User`: "Quero ver meu carrinho."
*   `Agent should`: Display the cart contents.

**5.4. Scenario: User navigates and looks for specific product types**
*   `User`: "Me leve para a seção de cuidados com a pele."
*   `Agent should`: Navigate to the skincare section.
*   `User`: "Estou procurando um hidratante para pele oleosa."
*   `Agent should`: List moisturizers for oily skin.
*   `User`: "Qual deles tem o melhor custo-benefício?"
*   `Agent should`: Provide a recommendation based on price and maybe reviews/ratings.
*   `User`: "Adicione esse no carrinho."
*   `Agent should`: Add the recommended product to the cart.
*   `User`: "Agora me mostre a seção de protetores solares."
*   `Agent should`: Navigate to the sunscreen section.
*   `User`: "Quero um com cor e FPS 50."
*   `Agent should`: Filter and show tinted sunscreens with SPF 50.
*   `User`: "Adicione o da Bioré no carrinho."
*   `Agent should`: Add the Bioré sunscreen to the cart.
*   `User`: "Finalizar compra."
*   `Agent should`: Start the checkout process.

**5.5. Scenario: User interacts with the cart and continues shopping**
*   `User`: "Quais os itens no meu carrinho?"
*   `Agent should`: Show the cart items.
*   `User`: "Remova o último item que adicionei."
*   `Agent should`: Remove the last added item.
*   `User`: "Na verdade, pode limpar o carrinho todo."
*   `Agent should`: Clear the cart.
*   `User`: "Agora quero procurar por um anticaspa."
*   `Agent should`: Search for anti-dandruff products.
*   `User`: "Adicione o mais barato no carrinho."
*   `Agent should`: Find the cheapest one and add it to the cart.
*   `User`: "Obrigado, era só isso."
*   `Agent should`: End the conversation.

---

### 6. Edge Case Scenarios

**6.1. Scenario: Non-existent or Unusual Requests**
*   `User`: "Quero um remédio para picada de unicórnio."
*   `Agent should`: Inform the user that the product does not exist.
*   `User`: "Adicione 50 caixas de Dipirona no carrinho"
*   `Agent should`: Handle the large quantity, possibly warning the user or checking stock limits.
*   `User`: "Qual o produto mais caro da loja?"
*   `Agent should`: Identify and show the most expensive product available.
*   `User`: "Qual o mais barato?"
*   `Agent should`: Identify and show the least expensive product available.
*   `User`: "Navegue para a página de contato"
*   `Agent should`: Navigate the user to the contact page.
*   `User`: "Limpe meu carrinho"
*   `Agent should`: Clear all items from the cart and confirm.
