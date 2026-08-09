import CheckoutView from '@/components/CheckoutView';

export const metadata = { title: 'Checkout — Ledgerline' };

export default async function CheckoutPage({ params }) {
  const { id } = await params;
  return <CheckoutView id={id} />;
}
