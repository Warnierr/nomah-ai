import { render } from '@react-email/render'
import { resend, EMAIL_CONFIG } from './resend'
import OrderConfirmationEmail from '@/components/emails/order-confirmation'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface ShippingAddress {
  fullName: string
  address: string
  city: string
  postalCode: string
  country: string
}

interface OrderConfirmationData {
  orderId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  total: number
  shippingAddress: ShippingAddress
  orderDate: string
}

export async function sendOrderConfirmationEmail(data: OrderConfirmationData) {
  try {
    if (!resend) {
      console.log('Resend not configured. Email would be sent to:', data.customerEmail)
      return { success: false, message: 'Email service not configured' }
    }

    const emailHtml = await render(
      OrderConfirmationEmail({
        orderId: data.orderId,
        customerName: data.customerName,
        items: data.items,
        total: data.total,
        shippingAddress: data.shippingAddress,
        orderDate: data.orderDate,
      })
    )

    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.customerEmail,
      subject: `Confirmation de votre commande #${data.orderId}`,
      html: emailHtml,
      replyTo: EMAIL_CONFIG.replyTo,
    })

    console.log('Email de confirmation envoyé:', result)
    return result
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error)
    throw error
  }
}

interface ShippingNotificationData {
  orderId: string
  customerName: string
  customerEmail: string
  trackingNumber: string
  carrier: string
  estimatedDelivery: string
}

export async function sendShippingNotificationEmail(data: ShippingNotificationData) {
  try {
    if (!resend) {
      console.log('Resend not configured. Shipping email would be sent to:', data.customerEmail)
      return { success: false, message: 'Email service not configured' }
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Votre commande a été expédiée</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #0070f3;">Votre commande a été expédiée !</h1>
            
            <p>Bonjour ${data.customerName},</p>
            
            <p>Bonne nouvelle ! Votre commande #${data.orderId} a été expédiée et est en route vers vous.</p>
            
            <div style="background-color: #f6f9fc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Informations de suivi</h3>
              <p><strong>Transporteur:</strong> ${data.carrier}</p>
              <p><strong>Numéro de suivi:</strong> ${data.trackingNumber}</p>
              <p><strong>Livraison estimée:</strong> ${data.estimatedDelivery}</p>
            </div>
            
            <p>Vous pouvez suivre votre colis en temps réel avec le numéro de suivi ci-dessus.</p>
            
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            
            <p style="margin-top: 30px;">
              Cordialement,<br>
              L'équipe Nomah AI
            </p>
          </div>
        </body>
      </html>
    `

    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.customerEmail,
      subject: `Votre commande #${data.orderId} a été expédiée`,
      html: emailHtml,
      replyTo: EMAIL_CONFIG.replyTo,
    })

    console.log('Email d\'expédition envoyé:', result)
    return result
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email d\'expédition:', error)
    throw error
  }
}

interface PasswordResetData {
  email: string
  name: string
  resetToken: string
}

interface MagicLinkData {
  email: string
  magicLink: string
  provider: string
}

export async function sendMagicLinkEmail(data: MagicLinkData) {
  try {
    if (!resend) {
      console.log('Resend not configured. Magic link email would be sent to:', data.email)
      return { success: false, message: 'Email service not configured' }
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Connexion à votre compte Nomah AI</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0070f3; margin-bottom: 10px;">🔗 Lien de connexion</h1>
              <p style="color: #666; font-size: 16px;">Connectez-vous à votre compte Nomah AI</p>
            </div>
            
            <p>Bonjour,</p>
            
            <p>Vous avez demandé à vous connecter à votre compte Nomah AI. Cliquez sur le bouton ci-dessous pour vous connecter instantanément :</p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${data.magicLink}" 
                 style="background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3);">
                🚀 Se connecter maintenant
              </a>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #0070f3; margin: 30px 0;">
              <p style="margin: 0; color: #475569;"><strong>💡 Astuce :</strong> Ce lien est sécurisé et ne fonctionne qu'une seule fois. Il expire automatiquement après 24 heures.</p>
            </div>
            
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #666; background-color: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">${data.magicLink}</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin-bottom: 5px;">
                <strong>Vous n'avez pas demandé cette connexion ?</strong>
              </p>
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Ignorez cet email en toute sécurité. Votre compte reste protégé.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                Cordialement,<br>
                <strong>L'équipe Nomah AI</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.email,
      subject: '🔗 Votre lien de connexion - Nomah AI',
      html: emailHtml,
      replyTo: EMAIL_CONFIG.replyTo,
    })

    console.log('Magic link email envoyé:', result)
    return result
  } catch (error) {
    console.error('Erreur lors de l\'envoi du magic link email:', error)
    throw error
  }
}

export async function sendPasswordResetEmail(data: PasswordResetData) {
  try {
    if (!resend) {
      console.log('Resend not configured. Password reset email would be sent to:', data.email)
      return { success: false, message: 'Email service not configured' }
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${data.resetToken}`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Réinitialisation de votre mot de passe</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #0070f3;">Réinitialisation de mot de passe</h1>
            
            <p>Bonjour ${data.name},</p>
            
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Nomah AI.</p>
            
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            
            <p><strong>Ce lien expire dans 1 heure.</strong></p>
            
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            
            <p style="margin-top: 30px;">
              Cordialement,<br>
              L'équipe Nomah AI
            </p>
          </div>
        </body>
      </html>
    `

    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.email,
      subject: 'Réinitialisation de votre mot de passe - Nomah AI',
      html: emailHtml,
      replyTo: EMAIL_CONFIG.replyTo,
    })

    console.log('Email de réinitialisation envoyé:', result)
    return result
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error)
    throw error
  }
}

// Fonction utilitaire pour tester l'envoi d'emails
export async function sendTestEmail(to: string) {
  try {
    if (!resend) {
      console.log('Resend not configured. Test email would be sent to:', to)
      return { success: false, message: 'Email service not configured' }
    }

    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to,
      subject: 'Test Email - Nomah AI',
      html: `
        <h1>Test Email</h1>
        <p>Ceci est un email de test depuis Nomah AI.</p>
        <p>Si vous recevez cet email, la configuration fonctionne correctement !</p>
      `,
      replyTo: EMAIL_CONFIG.replyTo,
    })

    console.log('Email de test envoyé:', result)
    return result
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de test:', error)
    throw error
  }
} 