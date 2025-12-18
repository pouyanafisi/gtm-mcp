/**
 * GTM Component Templates and Workflow Builder
 * Pre-built templates for common tracking scenarios
 */

import { GTMClient, CreateTagParams, TriggerCondition } from './gtm-client.js';

export interface SetupResult {
  success: boolean;
  setup?: string;
  results?: Array<[string, any]>;
  [key: string]: any;
}

/**
 * Create complete Google Analytics 4 setup
 */
export async function createGA4Setup(
  client: GTMClient,
  accountId: string,
  containerId: string,
  measurementId: string
): Promise<SetupResult> {
  const results: Array<[string, any]> = [];

  // Create GA4 Configuration Tag
  const configTagResult = await client.createTag(
    accountId,
    containerId,
    'GA4 Configuration - MCP',
    'gaawc',
    {
      tagId: measurementId,
      measurementIdOverride: measurementId,
    }
  );
  results.push(['GA4 Configuration Tag', configTagResult]);

  // Create Page View Trigger
  const pageviewTriggerResult = await client.createTrigger(
    accountId,
    containerId,
    'All Pages - MCP',
    'pageview',
    []
  );
  results.push(['Page View Trigger', pageviewTriggerResult]);

  // Create common event tags
  const events: Array<[string, string, CreateTagParams]> = [
    ['Scroll Depth', 'scroll', { scrollThreshold: '90' }],
    ['Outbound Click', 'click', { clickType: 'link' }],
    [
      'File Download',
      'file_download',
      { fileExtension: 'pdf,doc,docx,xls,xlsx' },
    ],
  ];

  for (const [eventName, eventType, params] of events) {
    const eventTagResult = await client.createTag(
      accountId,
      containerId,
      `GA4 Event - ${eventName} - MCP`,
      'gaawe',
      {
        measurementIdOverride: measurementId,
        eventName: eventType,
        ...params,
      }
    );
    results.push([`GA4 Event - ${eventName}`, eventTagResult]);
  }

  return {
    success: true,
    setup: 'GA4 Complete Setup',
    measurement_id: measurementId,
    results,
  };
}

/**
 * Create Facebook Pixel tracking setup
 */
export async function createFacebookPixelSetup(
  client: GTMClient,
  accountId: string,
  containerId: string,
  pixelId: string
): Promise<SetupResult> {
  const results: Array<[string, any]> = [];

  // Create Facebook Pixel Base Code
  const pixelTagResult = await client.createTag(
    accountId,
    containerId,
    'Facebook Pixel',
    'img',
    {
      url: `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`,
    }
  );
  results.push(['Facebook Pixel Base', pixelTagResult]);

  // Create Page View Trigger
  const pageviewTriggerResult = await client.createTrigger(
    accountId,
    containerId,
    'All Pages - Facebook',
    'pageview',
    []
  );
  results.push(['Page View Trigger', pageviewTriggerResult]);

  return {
    success: true,
    setup: 'Facebook Pixel Setup',
    pixel_id: pixelId,
    results,
  };
}

/**
 * Create form submission tracking
 */
export async function createFormTracking(
  client: GTMClient,
  accountId: string,
  containerId: string,
  formSelector: string,
  eventName: string = 'form_submit'
): Promise<SetupResult> {
  const results: Array<[string, any]> = [];

  // Create Form Submit Trigger
  const conditions: TriggerCondition[] = [
    {
      type: 'equals',
      parameter: [
        { key: 'arg0', value: '{{Form Element}}', type: 'template' },
        { key: 'arg1', value: formSelector, type: 'template' },
      ],
    },
  ];

  const formTriggerResult = await client.createTrigger(
    accountId,
    containerId,
    `Form Submit - ${formSelector}`,
    'formSubmission',
    conditions
  );
  results.push(['Form Submit Trigger', formTriggerResult]);

  // Create Custom Event Tag
  const eventTagResult = await client.createTag(
    accountId,
    containerId,
    `Form Submit Event - ${formSelector}`,
    'gaawe',
    {
      eventName: eventName,
      formSelector: formSelector,
    }
  );
  results.push(['Form Submit Event', eventTagResult]);

  return {
    success: true,
    setup: 'Form Tracking',
    form_selector: formSelector,
    event_name: eventName,
    results,
  };
}

/**
 * Generate complete workflows for different site types
 */
export async function generateGTMWorkflow(
  client: GTMClient,
  accountId: string,
  containerId: string,
  workflowType: 'ecommerce' | 'lead_generation' | 'content_site',
  ga4MeasurementId?: string,
  facebookPixelId?: string
): Promise<SetupResult> {
  const results: Array<[string, any]> = [];

  if (workflowType === 'ecommerce') {
    // Enhanced ecommerce tracking
    if (ga4MeasurementId) {
      const ga4Result = await createGA4Setup(
        client,
        accountId,
        containerId,
        ga4MeasurementId
      );
      results.push(['GA4 Setup', ga4Result]);
    }

    // Ecommerce events
    const ecommerceEvents: Array<[string, CreateTagParams]> = [
      [
        'purchase',
        {
          transactionId: '{{Transaction ID}}',
          value: '{{Revenue}}',
        },
      ],
      [
        'add_to_cart',
        {
          itemId: '{{Item ID}}',
          value: '{{Item Value}}',
        },
      ],
      ['remove_from_cart', { itemId: '{{Item ID}}' }],
      ['begin_checkout', {}],
    ];

    for (const [eventName, params] of ecommerceEvents) {
      const eventResult = await client.createTag(
        accountId,
        containerId,
        `GA4 Event - ${eventName}`,
        'gaawe',
        {
          measurementIdOverride: ga4MeasurementId || '',
          eventName: eventName,
          ...params,
        }
      );
      results.push([`Ecommerce Event - ${eventName}`, eventResult]);
    }
  } else if (workflowType === 'lead_generation') {
    // Lead generation tracking
    if (ga4MeasurementId) {
      const ga4Result = await createGA4Setup(
        client,
        accountId,
        containerId,
        ga4MeasurementId
      );
      results.push(['GA4 Setup', ga4Result]);
    }

    // Form tracking
    const formResult = await createFormTracking(
      client,
      accountId,
      containerId,
      '#contact-form',
      'form_submit'
    );
    results.push(['Form Tracking', formResult]);

    // CTA click tracking
    const ctaResult = await client.createTag(
      accountId,
      containerId,
      'CTA Click Event',
      'gaawe',
      {
        measurementIdOverride: ga4MeasurementId || '',
        eventName: 'cta_click',
        clickElement: '{{Click Element}}',
      }
    );
    results.push(['CTA Tracking', ctaResult]);
  } else if (workflowType === 'content_site') {
    // Content site tracking
    if (ga4MeasurementId) {
      const ga4Result = await createGA4Setup(
        client,
        accountId,
        containerId,
        ga4MeasurementId
      );
      results.push(['GA4 Setup', ga4Result]);
    }

    // Content engagement events
    const contentEvents: Array<[string, CreateTagParams]> = [
      ['newsletter_signup', {}],
      ['social_share', { sharePlatform: '{{Share Platform}}' }],
      ['video_play', { videoTitle: '{{Video Title}}' }],
      ['article_read', { articleTitle: '{{Article Title}}' }],
    ];

    for (const [eventName, params] of contentEvents) {
      const eventResult = await client.createTag(
        accountId,
        containerId,
        `Content Event - ${eventName}`,
        'gaawe',
        {
          measurementIdOverride: ga4MeasurementId || '',
          eventName: eventName,
          ...params,
        }
      );
      results.push([`Content Event - ${eventName}`, eventResult]);
    }
  }

  if (facebookPixelId) {
    const fbResult = await createFacebookPixelSetup(
      client,
      accountId,
      containerId,
      facebookPixelId
    );
    results.push(['Facebook Pixel', fbResult]);
  }

  return {
    success: true,
    workflow_type: workflowType,
    results,
  };
}

