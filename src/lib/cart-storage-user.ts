import { prisma } from '@/lib/prisma'

export interface UserCartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface UserCartData {
  userId: string
  items: UserCartItem[]
  total: number
  itemCount: number
}

/**
 * Obtém ou cria um carrinho para o usuário
 */
export async function getOrCreateUserCart(userId: string): Promise<UserCartData> {
  try {
    console.log(`🛒 [UserCart] Buscando carrinho para usuário: ${userId}`)
    
    // Buscar carrinho existente
    let userCart = await prisma.userCart.findUnique({
      where: { userId },
      include: {
        items: true
      }
    })

    // Se não existe, criar um novo
    if (!userCart) {
      console.log(`🆕 [UserCart] Criando novo carrinho para usuário: ${userId}`)
      userCart = await prisma.userCart.create({
        data: {
          userId,
          total: 0
        },
        include: {
          items: true
        }
      })
    }

    // Converter para formato esperado
    const cartData: UserCartData = {
      userId,
      items: userCart.items.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || undefined
      })),
      total: userCart.total,
      itemCount: userCart.items.reduce((sum, item) => sum + item.quantity, 0)
    }

    console.log(`✅ [UserCart] Carrinho obtido:`, cartData)
    return cartData
  } catch (error) {
    console.error('❌ [UserCart] Erro ao obter carrinho:', error)
    return {
      userId,
      items: [],
      total: 0,
      itemCount: 0
    }
  }
}

/**
 * Adiciona um item ao carrinho do usuário
 */
export async function addToUserCart(
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<UserCartData> {
  try {
    console.log(`➕ [UserCart] Adicionando item ao carrinho: userId=${userId}, productId=${productId}, quantity=${quantity}`)
    
    // Buscar produto
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      throw new Error(`Produto ${productId} não encontrado`)
    }

    // Obter ou criar carrinho
    let userCart = await prisma.userCart.findUnique({
      where: { userId },
      include: { items: true }
    })

    if (!userCart) {
      userCart = await prisma.userCart.create({
        data: {
          userId,
          total: 0
        },
        include: { items: true }
      })
    }

    // Verificar se o item já existe no carrinho
    const existingItem = await prisma.userCartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: userCart.id,
          productId
        }
      }
    })

    if (existingItem) {
      // Atualizar quantidade
      await prisma.userCartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity
        }
      })
    } else {
      // Criar novo item
      await prisma.userCartItem.create({
        data: {
          cartId: userCart.id,
          productId,
          name: product.name,
          price: product.price,
          quantity,
          image: product.image
        }
      })
    }

    // Recalcular total
    await updateCartTotal(userCart.id)

    // Retornar carrinho atualizado
    return await getOrCreateUserCart(userId)
  } catch (error) {
    console.error('❌ [UserCart] Erro ao adicionar item:', error)
    throw error
  }
}

/**
 * Remove um item do carrinho do usuário
 */
export async function removeFromUserCart(
  userId: string,
  productId: string
): Promise<UserCartData> {
  try {
    console.log(`🗑️ [UserCart] Removendo item: userId=${userId}, productId=${productId}`)
    
    const userCart = await prisma.userCart.findUnique({
      where: { userId }
    })

    if (!userCart) {
      return await getOrCreateUserCart(userId)
    }

    // Remover item
    await prisma.userCartItem.deleteMany({
      where: {
        cartId: userCart.id,
        productId
      }
    })

    // Recalcular total
    await updateCartTotal(userCart.id)

    return await getOrCreateUserCart(userId)
  } catch (error) {
    console.error('❌ [UserCart] Erro ao remover item:', error)
    throw error
  }
}

/**
 * Atualiza a quantidade de um item no carrinho
 */
export async function updateUserCartQuantity(
  userId: string,
  productId: string,
  quantity: number
): Promise<UserCartData> {
  try {
    console.log(`🔄 [UserCart] Atualizando quantidade: userId=${userId}, productId=${productId}, quantity=${quantity}`)
    
    if (quantity <= 0) {
      return await removeFromUserCart(userId, productId)
    }

    const userCart = await prisma.userCart.findUnique({
      where: { userId }
    })

    if (!userCart) {
      return await getOrCreateUserCart(userId)
    }

    // Atualizar quantidade
    await prisma.userCartItem.updateMany({
      where: {
        cartId: userCart.id,
        productId
      },
      data: {
        quantity
      }
    })

    // Recalcular total
    await updateCartTotal(userCart.id)

    return await getOrCreateUserCart(userId)
  } catch (error) {
    console.error('❌ [UserCart] Erro ao atualizar quantidade:', error)
    throw error
  }
}

/**
 * Limpa o carrinho do usuário
 */
export async function clearUserCart(userId: string): Promise<UserCartData> {
  try {
    console.log(`🧹 [UserCart] Limpando carrinho: userId=${userId}`)
    
    const userCart = await prisma.userCart.findUnique({
      where: { userId }
    })

    if (userCart) {
      // Remover todos os itens
      await prisma.userCartItem.deleteMany({
        where: {
          cartId: userCart.id
        }
      })

      // Zerar total
      await prisma.userCart.update({
        where: { id: userCart.id },
        data: { total: 0 }
      })
    }

    return await getOrCreateUserCart(userId)
  } catch (error) {
    console.error('❌ [UserCart] Erro ao limpar carrinho:', error)
    throw error
  }
}

/**
 * Atualiza o total do carrinho
 */
async function updateCartTotal(cartId: string): Promise<void> {
  try {
    const items = await prisma.userCartItem.findMany({
      where: { cartId }
    })

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    await prisma.userCart.update({
      where: { id: cartId },
      data: { total }
    })
  } catch (error) {
    console.error('❌ [UserCart] Erro ao atualizar total:', error)
  }
}