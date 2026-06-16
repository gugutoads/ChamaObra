let stripe;

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    stripe = require('stripe')(key);
  }
  return stripe;
}

async function createCheckoutSession(propostaId, valor) {
  try {
    const stripeClient = getStripe();
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Pagamento de Serviço - Proposta ${propostaId}`,
            },
            unit_amount: Math.round(valor * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://checkout.stripe.com/success', // Em produção, use um link para o app ou página de sucesso
      cancel_url: 'https://checkout.stripe.com/cancel',
      metadata: { propostaId: String(propostaId) },
    });

    return session.url;
  } catch (error) {
    console.error('Erro ao criar Checkout Session no Stripe:', error);
    throw error;
  }
}

module.exports = {
  createCheckoutSession,
};
