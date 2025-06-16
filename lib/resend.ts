import { Resend } from 'resend'

// Configuration conditionnelle pour le développement
const resendApiKey = process.env.RESEND_API_KEY || 'demo-key'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not defined. Email functionality will be disabled.')
}

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Configuration des emails
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Nomah AI <noreply@nomah-ai.com>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@nomah-ai.com',
} as const 