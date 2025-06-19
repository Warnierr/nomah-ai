import { Resend } from 'resend'

// Configuration Resend centralisée
export const resend = new Resend(process.env.RESEND_API_KEY)

export const RESEND_CONFIG = {
  isConfigured: !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key',
  from: process.env.EMAIL_FROM || 'noreply@nomah-ai.com'
}

// Configuration des emails
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Nomah AI <noreply@nomah-ai.com>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@nomah-ai.com',
} as const 