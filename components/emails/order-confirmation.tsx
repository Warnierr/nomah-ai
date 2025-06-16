import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components'

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

interface OrderConfirmationEmailProps {
  orderId: string
  customerName: string
  items: OrderItem[]
  total: number
  shippingAddress: ShippingAddress
  orderDate: string
}

export default function OrderConfirmationEmail({
  orderId,
  customerName,
  items,
  total,
  shippingAddress,
  orderDate,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirmation de votre commande #{orderId}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=50&fit=crop"
              width="200"
              height="50"
              alt="Nomah AI"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Merci pour votre commande !</Heading>
            
            <Text style={text}>
              Bonjour {customerName},
            </Text>
            
            <Text style={text}>
              Nous avons bien reçu votre commande #{orderId} passée le {new Date(orderDate).toLocaleDateString('fr-FR')}. 
              Voici le récapitulatif de votre achat :
            </Text>

            {/* Order Items */}
            <Section style={orderSection}>
              <Heading style={h2}>Articles commandés</Heading>
              {items.map((item) => (
                <Row key={item.id} style={itemRow}>
                  <Column style={itemImageColumn}>
                    {item.image && (
                      <Img
                        src={item.image}
                        width="60"
                        height="60"
                        alt={item.name}
                        style={itemImage}
                      />
                    )}
                  </Column>
                  <Column style={itemDetailsColumn}>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemDetails}>
                      Quantité: {item.quantity} × {item.price.toFixed(2)} €
                    </Text>
                  </Column>
                  <Column style={itemPriceColumn}>
                    <Text style={itemPrice}>
                      {(item.price * item.quantity).toFixed(2)} €
                    </Text>
                  </Column>
                </Row>
              ))}
              
              <Row style={totalRow}>
                <Column>
                  <Text style={totalText}>
                    <strong>Total: {total.toFixed(2)} €</strong>
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Shipping Address */}
            <Section style={addressSection}>
              <Heading style={h2}>Adresse de livraison</Heading>
              <Text style={addressText}>
                {shippingAddress.fullName}<br />
                {shippingAddress.address}<br />
                {shippingAddress.postalCode} {shippingAddress.city}<br />
                {shippingAddress.country}
              </Text>
            </Section>

            {/* Next Steps */}
            <Section style={nextStepsSection}>
              <Heading style={h2}>Prochaines étapes</Heading>
              <Text style={text}>
                • Nous préparons votre commande<br />
                • Vous recevrez un email de confirmation d'expédition avec le numéro de suivi<br />
                • Livraison estimée : 2-3 jours ouvrés
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Link
                style={button}
                href={`${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}`}
              >
                Suivre ma commande
              </Link>
            </Section>

            <Text style={text}>
              Si vous avez des questions, n'hésitez pas à nous contacter à support@nomah-ai.com
            </Text>

            <Text style={signature}>
              L'équipe Nomah AI
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2024 Nomah AI. Tous droits réservés.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  padding: '20px 30px',
  borderBottom: '1px solid #e6ebf1',
}

const logo = {
  margin: '0 auto',
}

const content = {
  padding: '30px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  margin: '0 0 20px',
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.25',
  margin: '30px 0 15px',
}

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 16px',
}

const orderSection = {
  border: '1px solid #e6ebf1',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const itemRow = {
  borderBottom: '1px solid #f6f9fc',
  paddingBottom: '15px',
  marginBottom: '15px',
}

const itemImageColumn = {
  width: '80px',
  verticalAlign: 'top',
}

const itemDetailsColumn = {
  verticalAlign: 'top',
  paddingLeft: '15px',
}

const itemPriceColumn = {
  width: '100px',
  textAlign: 'right' as const,
  verticalAlign: 'top',
}

const itemImage = {
  borderRadius: '4px',
}

const itemName = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 5px',
}

const itemDetails = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0',
}

const itemPrice = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
}

const totalRow = {
  borderTop: '2px solid #e6ebf1',
  paddingTop: '15px',
  marginTop: '15px',
}

const totalText = {
  color: '#1a1a1a',
  fontSize: '18px',
  textAlign: 'right' as const,
  margin: '0',
}

const addressSection = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const addressText = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0',
}

const nextStepsSection = {
  margin: '30px 0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '30px 0',
}

const button = {
  backgroundColor: '#0070f3',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const signature = {
  color: '#525f7f',
  fontSize: '16px',
  fontStyle: 'italic',
  margin: '30px 0 0',
}

const footer = {
  borderTop: '1px solid #e6ebf1',
  padding: '20px 30px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  margin: '0',
} 