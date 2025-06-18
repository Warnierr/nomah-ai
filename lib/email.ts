import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

export async function sendOrderConfirmationEmail({
  email,
  orderId,
  total,
}: {
  email: string
  orderId: string
  total: number
}) {
  // Si Resend n'est pas configuré ou mal configuré, on log et on continue
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || process.env.RESEND_API_KEY === 'your_resend_api_key') {
    console.log('📧 Email service not configured. Order confirmation email would be sent to:', email)
    console.log('📧 Order ID:', orderId, 'Total:', total + '€')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: `Confirmation de commande #${orderId}`,
      html: `
        <h1>Merci pour votre commande !</h1>
        <p>Votre commande #${orderId} a bien été confirmée.</p>
        <p>Montant total : ${total}€</p>
        <p>Nous vous tiendrons informé du statut de votre commande.</p>
      `,
    })

    if (error) {
      console.error('❌ Failed to send order confirmation email:', error)
      return { success: false, message: 'Failed to send email', error }
    }

    console.log('✅ Email de confirmation envoyé avec succès')
    return data
  } catch (error) {
    console.error('❌ Email service error:', error)
    return { success: false, message: 'Email service error', error }
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
      from: process.env.EMAIL_FROM!,
      to: data.customerEmail,
      subject: `Votre commande #${data.orderId} a été expédiée`,
      html: emailHtml,
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

export async function sendMagicLinkEmail({
  email,
  magicLink,
  provider,
}: {
  email: string
  magicLink: string
  provider: string
}) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: `Connexion à Nomah AI avec ${provider}`,
    html: `
      <h1>Bienvenue sur Nomah AI</h1>
      <p>Cliquez sur le lien ci-dessous pour vous connecter :</p>
      <a href="${magicLink}">${magicLink}</a>
      <p>Ce lien expire dans 24 heures.</p>
    `,
  })

  if (error) {
    console.error('Failed to send magic link email:', error)
    throw new Error('Failed to send verification email')
  }

  return data
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
      from: process.env.EMAIL_FROM!,
      to: data.email,
      subject: 'Réinitialisation de votre mot de passe - Nomah AI',
      html: emailHtml,
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
      from: process.env.EMAIL_FROM!,
      to,
      subject: 'Test Email - Nomah AI',
      html: `
        <h1>Test Email</h1>
        <p>Ceci est un email de test depuis Nomah AI.</p>
        <p>Si vous recevez cet email, la configuration fonctionne correctement !</p>
      `,
    })

    console.log('Email de test envoyé:', result)
    return result
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de test:', error)
    throw error
  }
} 