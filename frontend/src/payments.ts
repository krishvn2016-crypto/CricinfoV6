/**
 * Razorpay Checkout — loads the JS SDK on web and opens checkout.
 * For native preview, falls back to opening Razorpay hosted checkout URL.
 */
import { Platform, Linking, Alert } from 'react-native';
import { miscApi } from './api';

declare global { interface Window { Razorpay?: any } }

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export async function buyAIPack(onSuccess: () => void, onFailure?: (msg: string) => void) {
  try {
    const orderRes = await miscApi.createOrder('ai_5_pack');
    const { order_id, amount, currency, key_id, name, email } = orderRes.data;

    if (Platform.OS === 'web') {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        onFailure?.('Could not load payment gateway');
        return;
      }
      const rz = new window.Razorpay({
        key: key_id,
        amount,
        currency,
        order_id,
        name: 'CricLive',
        description: '5 AI Queries Pack',
        prefill: { name, email },
        theme: { color: '#111418' },
        handler: async (resp: any) => {
          try {
            await miscApi.verifyPayment(resp.razorpay_order_id, resp.razorpay_payment_id, resp.razorpay_signature);
            onSuccess();
          } catch {
            onFailure?.('Payment verification failed. If amount was debited, contact support.');
          }
        },
        modal: {
          ondismiss: () => onFailure?.('Payment cancelled'),
        },
      });
      rz.open();
    } else {
      // Native fallback: open Razorpay hosted payment link
      const url = `https://api.razorpay.com/v1/checkout/embedded?key_id=${key_id}&order_id=${order_id}&amount=${amount}&currency=${currency}&name=CricLive&description=5%20AI%20Queries%20Pack&prefill[name]=${encodeURIComponent(name)}&prefill[email]=${encodeURIComponent(email)}`;
      Alert.alert(
        'Opening Razorpay',
        'Complete the payment in the browser. Return to the app after payment — your bonus will be applied automatically once verified.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => Linking.openURL(url) },
        ]
      );
      // Native auto-verify via webhook would be needed for production; for test we surface manual OK
      onFailure?.('Finish the payment in the browser to receive your queries.');
    }
  } catch (e: any) {
    onFailure?.(e?.response?.data?.detail || 'Failed to start payment');
  }
}
