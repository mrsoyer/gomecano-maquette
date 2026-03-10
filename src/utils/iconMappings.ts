/**
 * Mapping des emojis vers icones Material Design Icons (MDI)
 * Utilise avec Iconify pour design professionnel
 */

export const ICON_MAPPINGS = {
  // Vehicules et transport
  '🚗': 'mdi:car',
  '🚙': 'mdi:car-side',
  '🚕': 'mdi:taxi',
  '🚛': 'mdi:truck',
  
  // Commerce et e-commerce
  '🛒': 'mdi:cart',
  '💳': 'mdi:credit-card',
  '💰': 'mdi:cash',
  
  // Localisation et navigation
  '📍': 'mdi:map-marker',
  '🗺️': 'mdi:map',
  
  // Validation et status
  '✓': 'mdi:check',
  '✅': 'mdi:check-circle',
  '❌': 'mdi:close-circle',
  '⚠️': 'mdi:alert',
  '⚠': 'mdi:alert',
  
  // Outils generaux
  '🔧': 'mdi:wrench',
  '⚙️': 'mdi:cog',
  '🛠️': 'mdi:tools',
  '🔨': 'mdi:hammer',
  
  // Services automobile specifiques
  '🛢️': 'mdi:oil',                    // Vidange
  '❄️': 'mdi:snowflake',               // Climatisation
  '🔩': 'mdi:nut',                     // Embrayage
  '🔴': 'mdi:car-brake-abs',           // Freins
  '⚡': 'mdi:lightning-bolt',          // Amortisseurs / Electrique
  '🌡️': 'mdi:thermometer',            // Radiateur / Temperature
  
  // UI et actions
  '📅': 'mdi:calendar',
  '📄': 'mdi:file-document',
  '📸': 'mdi:camera',
  '💡': 'mdi:lightbulb',
  '🎉': 'mdi:party-popper',
  '🔍': 'mdi:magnify',
  '⭐': 'mdi:star',
  '🚀': 'mdi:rocket',
  '📤': 'mdi:share',
  '↑': 'mdi:arrow-up',
  '→': 'mdi:arrow-right',
  
  // Personnes et utilisateurs
  '👨‍🔧': 'mdi:account-wrench',
  '👤': 'mdi:account',
  '👥': 'mdi:account-multiple',
  
  // Communication
  '📧': 'mdi:email',
  '📞': 'mdi:phone',
  '💬': 'mdi:message',
  
  // Autres
  '🏠': 'mdi:home',
  '🔒': 'mdi:lock',
  '🔓': 'mdi:lock-open',
  '⏱️': 'mdi:timer',
  '⌚': 'mdi:clock'
} as const

/**
 * Get icon name from emoji
 */
export function getIconFromEmoji(emoji: string): string {
  return ICON_MAPPINGS[emoji as keyof typeof ICON_MAPPINGS] || 'mdi:help-circle'
}





