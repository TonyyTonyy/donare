export const categoryLabels: Record<string, string> = {
  CLOTHING: 'Roupas (Geral)',
  CLOTHING_MALE: 'Roupas Masculinas',
  CLOTHING_FEMALE: 'Roupas Femininas',
  CLOTHING_KIDS: 'Roupas Infantis',
  SHOES: 'Calçados',
  FURNITURE: 'Móveis (Geral)',
  FURNITURE_LIVING: 'Móveis — Sala',
  FURNITURE_BEDROOM: 'Móveis — Quarto',
  FURNITURE_KITCHEN: 'Móveis — Cozinha',
  ELECTRONICS: 'Eletrônicos (Geral)',
  ELECTRONICS_IT: 'Informática',
  ELECTRONICS_HOME: 'Eletrodomésticos',
  ELECTRONICS_AUDIO: 'Áudio & Vídeo',
  BOOKS: 'Livros',
  TOYS: 'Brinquedos',
  SPORTS: 'Esporte & Lazer',
  KITCHEN: 'Utensílios de Cozinha',
  DECORATION: 'Decoração',
  OTHER: 'Outros',
}
 
export const conditionLabels: Record<string, string> = {
  NEW: 'Novo',
  LIKE_NEW: 'Seminovo',
  GOOD: 'Bom estado',
  FAIR: 'Razoável',
}
 
export const pickupTypeLabels: Record<string, string> = {
  HOME: 'Retirada em casa',
  NEUTRAL_POINT: 'Ponto neutro',
  STORE: 'Loja / Estabelecimento',
  OTHER: 'Outro',
}

export const SIZE_OPTIONS: Record<string, string[]> = {
  CLOTHING: ['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único'],
  CLOTHING_MALE: ['PP', 'P', 'M', 'G', 'GG', 'XG'],
  CLOTHING_FEMALE: ['PP', 'P', 'M', 'G', 'GG', 'XG'],
  CLOTHING_KIDS: ['2', '4', '6', '8', '10', '12', '14', '16'],
  SHOES: ['33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
}

export const CATEGORIES_WITH_SIZE = new Set([
  'CLOTHING', 'CLOTHING_MALE', 'CLOTHING_FEMALE', 'CLOTHING_KIDS', 'SHOES',
])
 
export const CATEGORIES_WITH_BRAND = new Set([
  'CLOTHING', 'CLOTHING_MALE', 'CLOTHING_FEMALE', 'CLOTHING_KIDS', 'SHOES',
  'ELECTRONICS', 'ELECTRONICS_IT', 'ELECTRONICS_HOME', 'ELECTRONICS_AUDIO',
])
 
export const CATEGORIES_WITH_IS_WORKING = new Set([
  'ELECTRONICS', 'ELECTRONICS_IT', 'ELECTRONICS_HOME', 'ELECTRONICS_AUDIO',
  'KITCHEN',
])