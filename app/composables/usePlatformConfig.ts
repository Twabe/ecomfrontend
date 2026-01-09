import { PlatformType } from '~/types/platformintegration'

export interface PlatformInstruction {
  title: string
  description: string
  link?: {
    url: string
    label: string
  }
  image?: string
}

export interface PlatformConfig {
  type: PlatformType | 'googleSheets'
  name: string
  description: string
  color: string
  bgColor: string
  darkBgColor: string
  icon: string
  isScriptBased?: boolean
  isOAuth?: boolean  // For platforms that support OAuth (like YouCan)
  adminUrl?: string
  webhookPath?: string
  instructions: PlatformInstruction[]
  events: string[]
  helpUrl?: string
  videoUrl?: string
}

const platformConfigs: Record<string, PlatformConfig> = {
  [PlatformType.YouCan]: {
    type: PlatformType.YouCan,
    name: 'YouCan',
    description: 'integrations.platforms.youcan.desc',
    color: '#2563EB',
    bgColor: '#EBF5FF',
    darkBgColor: '#1E3A5F',
    icon: 'youcan',
    isOAuth: true,  // YouCan supports OAuth - no manual webhook setup needed
    adminUrl: 'https://seller.youcan.shop',
    webhookPath: 'Settings → Webhooks',
    instructions: [
      {
        title: 'integrations.instructions.youcan.step1',
        description: 'integrations.instructions.youcan.step1Desc',
        link: { url: 'https://seller.youcan.shop', label: 'YouCan Dashboard' }
      },
      {
        title: 'integrations.instructions.youcan.step2',
        description: 'integrations.instructions.youcan.step2Desc'
      },
      {
        title: 'integrations.instructions.youcan.step3',
        description: 'integrations.instructions.youcan.step3Desc'
      },
      {
        title: 'integrations.instructions.youcan.step4',
        description: 'integrations.instructions.youcan.step4Desc'
      },
      {
        title: 'integrations.instructions.youcan.step5',
        description: 'integrations.instructions.youcan.step5Desc'
      }
    ],
    events: ['order.created', 'order.updated', 'order.cancelled'],
    helpUrl: 'https://help.youcan.shop/webhooks'
  },

  [PlatformType.Shopify]: {
    type: PlatformType.Shopify,
    name: 'Shopify',
    description: 'integrations.platforms.shopify.desc',
    color: '#96BF48',
    bgColor: '#F0FDF4',
    darkBgColor: '#1A3D1A',
    icon: 'shopify',
    // Webhook-based (no OAuth) - user manually adds webhook in Shopify admin
    adminUrl: 'https://admin.shopify.com',
    webhookPath: 'Settings → Notifications → Webhooks',
    instructions: [
      {
        title: 'integrations.instructions.shopify.step1',
        description: 'integrations.instructions.shopify.step1Desc',
        link: { url: 'https://admin.shopify.com', label: 'Shopify Admin' }
      },
      {
        title: 'integrations.instructions.shopify.step2',
        description: 'integrations.instructions.shopify.step2Desc'
      },
      {
        title: 'integrations.instructions.shopify.step3',
        description: 'integrations.instructions.shopify.step3Desc'
      },
      {
        title: 'integrations.instructions.shopify.step4',
        description: 'integrations.instructions.shopify.step4Desc'
      },
      {
        title: 'integrations.instructions.shopify.step5',
        description: 'integrations.instructions.shopify.step5Desc'
      }
    ],
    events: ['orders/create', 'orders/updated', 'orders/cancelled'],
    helpUrl: 'https://help.shopify.com/en/manual/orders/notifications/webhooks'
  },

  [PlatformType.WooCommerce]: {
    type: PlatformType.WooCommerce,
    name: 'WooCommerce',
    description: 'integrations.platforms.woocommerce.desc',
    color: '#96588A',
    bgColor: '#FAF5F9',
    darkBgColor: '#3D2339',
    icon: 'woocommerce',
    webhookPath: 'WooCommerce → Settings → Advanced → Webhooks',
    instructions: [
      {
        title: 'integrations.instructions.woocommerce.step1',
        description: 'integrations.instructions.woocommerce.step1Desc'
      },
      {
        title: 'integrations.instructions.woocommerce.step2',
        description: 'integrations.instructions.woocommerce.step2Desc'
      },
      {
        title: 'integrations.instructions.woocommerce.step3',
        description: 'integrations.instructions.woocommerce.step3Desc'
      },
      {
        title: 'integrations.instructions.woocommerce.step4',
        description: 'integrations.instructions.woocommerce.step4Desc'
      },
      {
        title: 'integrations.instructions.woocommerce.step5',
        description: 'integrations.instructions.woocommerce.step5Desc'
      }
    ],
    events: ['woocommerce_order_created', 'woocommerce_order_updated'],
    helpUrl: 'https://woocommerce.com/document/webhooks/'
  },

  [PlatformType.LightFunnels]: {
    type: PlatformType.LightFunnels,
    name: 'LightFunnels',
    description: 'integrations.platforms.lightfunnels.desc',
    color: '#FF6B35',
    bgColor: '#FFF7ED',
    darkBgColor: '#3D2B1F',
    icon: 'lightfunnels',
    webhookPath: 'Settings → Advanced → Webhooks',
    instructions: [
      {
        title: 'integrations.instructions.lightfunnels.step1',
        description: 'integrations.instructions.lightfunnels.step1Desc'
      },
      {
        title: 'integrations.instructions.lightfunnels.step2',
        description: 'integrations.instructions.lightfunnels.step2Desc'
      },
      {
        title: 'integrations.instructions.lightfunnels.step3',
        description: 'integrations.instructions.lightfunnels.step3Desc'
      },
      {
        title: 'integrations.instructions.lightfunnels.step4',
        description: 'integrations.instructions.lightfunnels.step4Desc'
      }
    ],
    events: ['order.created'],
    helpUrl: 'https://lightfunnels.com/docs/webhooks'
  },

  [PlatformType.Storeep]: {
    type: PlatformType.Storeep,
    name: 'Storeep',
    description: 'integrations.platforms.storeep.desc',
    color: '#00BCD4',
    bgColor: '#E0F7FA',
    darkBgColor: '#1A3D3D',
    icon: 'storeep',
    webhookPath: 'Storeep → Réglages → Webhooks',
    instructions: [
      {
        title: 'integrations.instructions.storeep.step1',
        description: 'integrations.instructions.storeep.step1Desc'
      },
      {
        title: 'integrations.instructions.storeep.step2',
        description: 'integrations.instructions.storeep.step2Desc'
      },
      {
        title: 'integrations.instructions.storeep.step3',
        description: 'integrations.instructions.storeep.step3Desc'
      },
      {
        title: 'integrations.instructions.storeep.step4',
        description: 'integrations.instructions.storeep.step4Desc'
      }
    ],
    events: ['order.created']
  },

  googleSheets: {
    type: 'googleSheets',
    name: 'Google Sheets',
    description: 'integrations.platforms.sheets.desc',
    color: '#0F9D58',
    bgColor: '#E8F5E9',
    darkBgColor: '#1A3D2A',
    icon: 'sheets',
    isScriptBased: true,
    instructions: [
      {
        title: 'integrations.instructions.sheets.step1',
        description: 'integrations.instructions.sheets.step1Desc',
        link: { url: 'https://sheets.google.com', label: 'Google Sheets' }
      },
      {
        title: 'integrations.instructions.sheets.step2',
        description: 'integrations.instructions.sheets.step2Desc'
      },
      {
        title: 'integrations.instructions.sheets.step3',
        description: 'integrations.instructions.sheets.step3Desc'
      },
      {
        title: 'integrations.instructions.sheets.step4',
        description: 'integrations.instructions.sheets.step4Desc'
      },
      {
        title: 'integrations.instructions.sheets.step5',
        description: 'integrations.instructions.sheets.step5Desc'
      },
      {
        title: 'integrations.instructions.sheets.step6',
        description: 'integrations.instructions.sheets.step6Desc'
      }
    ],
    events: ['manual_sync'],
    helpUrl: 'https://developers.google.com/apps-script'
  }
}

export function usePlatformConfig() {
  const config = useRuntimeConfig()

  const getPlatformConfig = (type: PlatformType | 'googleSheets'): PlatformConfig | undefined => {
    return platformConfigs[type]
  }

  const getAllPlatforms = (): PlatformConfig[] => {
    return Object.values(platformConfigs)
  }

  const getWebhookPlatforms = (): PlatformConfig[] => {
    return Object.values(platformConfigs).filter(p => !p.isScriptBased)
  }

  const getScriptPlatforms = (): PlatformConfig[] => {
    return Object.values(platformConfigs).filter(p => p.isScriptBased)
  }

  const generateWebhookUrl = (integrationId: string): string => {
    const apiBase = config.public.apiBaseUrl || 'http://ecombackend.ecom.astracaisse.com'
    return `${apiBase}/api/v1/webhooks/${integrationId}`
  }

  const generateGoogleSheetsScript = (integrationId: string): string => {
    const apiBase = config.public.apiBaseUrl || 'http://ecombackend.ecom.astracaisse.com'
    return `// Google Sheets Integration Script
// Generated for Integration ID: ${integrationId}

const API_URL = '${apiBase}/api/v1/webhooks/sheets/${integrationId}';

function onFormSubmit(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const lastRow = sheet.getLastRow();
    const data = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];

    const order = {};
    headers.forEach((header, index) => {
      order[header] = data[index];
    });

    const options = {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify({
        source: 'google_sheets',
        data: order
      }),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(API_URL, options);
    Logger.log('Response: ' + response.getContentText());

  } catch (error) {
    Logger.log('Error: ' + error.toString());
  }
}

function setupTrigger() {
  // Remove existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new trigger
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();

  Logger.log('Trigger created successfully!');
}

// Run setupTrigger() once to initialize the integration
`
  }

  const getPlatformIcon = (type: PlatformType | 'googleSheets'): string => {
    const config = getPlatformConfig(type)
    return config?.icon || 'default'
  }

  const getPlatformColor = (type: PlatformType | 'googleSheets'): { color: string; bgColor: string; darkBgColor: string } => {
    const config = getPlatformConfig(type)
    return {
      color: config?.color || '#6B7280',
      bgColor: config?.bgColor || '#F3F4F6',
      darkBgColor: config?.darkBgColor || '#374151'
    }
  }

  return {
    getPlatformConfig,
    getAllPlatforms,
    getWebhookPlatforms,
    getScriptPlatforms,
    generateWebhookUrl,
    generateGoogleSheetsScript,
    getPlatformIcon,
    getPlatformColor
  }
}
