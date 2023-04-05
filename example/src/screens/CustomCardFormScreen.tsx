import {
  createPaymentMethodFromCustomCardForm,
  initStripe,
} from '@stripe/stripe-react-native';
import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { colors } from '../colors';
import Button from '../components/Button';
import { fetchPublishableKey } from '../helpers';

/**
 * Quick made example to use custom card form and get a payment method id from it
 * This is just an example, customize it on your way according to your needs
 */
export default function CustomCardFormScreen() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [paymentMethodId, setPaymentMethodId] = useState<string | undefined>();

  const [cardNumber, setCardNumber] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardExpirationMonth, setCardExpirationMonth] = useState<number>();
  const [cardExpirationYear, setCardExpirationYear] = useState<number>();

  useEffect(() => {
    async function initialize() {
      const publishableKey = await fetchPublishableKey('card');
      if (publishableKey) {
        await initStripe({
          publishableKey,
          merchantIdentifier: 'merchant.com.stripe.react.native',
          urlScheme: 'stripe-example',
          setReturnUrlSchemeOnAndroid: true,
        });
        setLoading(false);
      }
    }
    initialize();
  }, []);

  const onCardNumberChange = (value: string) => {
    setCardNumber(value);
  };

  const onCardCVCChange = (value: string) => {
    setCardCVC(value);
  };

  const onCardExpirationChange = (value: string) => {
    const [expMonth, expYear] = value.split('/');
    setCardExpirationMonth(+expMonth);
    setCardExpirationYear(+expYear);
  };

  const onAddCardPress = async () => {
    if (cardNumber && cardCVC && cardExpirationMonth && cardExpirationYear) {
      setLoading(true);
      setPaymentMethodId(undefined);
      setErrorMessage(undefined);
      const { paymentMethod, error } =
        await createPaymentMethodFromCustomCardForm({
          paymentMethodType: 'Card',
          card: {
            number: cardNumber,
            cvc: cardCVC,
            expMonth: cardExpirationMonth,
            expYear: cardExpirationYear,
            name: 'Stripe',
          },
        });
      if (error) {
        setErrorMessage(error.stripeErrorCode + ' - ' + error.message);
      } else {
        setPaymentMethodId(paymentMethod?.id);
      }
      setLoading(false);
    }
  };

  return loading ? (
    <ActivityIndicator size="large" style={StyleSheet.absoluteFill} />
  ) : (
    <View style={styles.container}>
      <TextInput
        autoCapitalize="none"
        placeholder="4242 4242 4242 4242"
        keyboardType={'numeric'}
        onChangeText={onCardNumberChange}
        style={styles.cardNumberInput}
        placeholderTextColor={colors.dark_gray}
      />
      <View style={styles.cardCVCExpirationContainer}>
        <TextInput
          autoCapitalize="none"
          placeholder="CVC"
          keyboardType={'numeric'}
          onChangeText={onCardCVCChange}
          style={styles.input}
          placeholderTextColor={colors.dark_gray}
        />
        <View style={styles.divider} />
        <TextInput
          autoCapitalize="none"
          placeholder="MM/YY"
          onChangeText={onCardExpirationChange}
          style={styles.input}
          placeholderTextColor={colors.dark_gray}
        />
      </View>
      <Button
        variant="primary"
        onPress={onAddCardPress}
        title="Add card"
        disabled={
          !cardNumber || !cardCVC || !cardExpirationMonth || !cardExpirationYear
        }
      />
      {/* eslint-disable-next-line react-native/no-inline-styles */}
      <View style={{ marginVertical: 8 }}>
        {errorMessage && (
          <Text style={styles.errorText}>
            An error occurred : {errorMessage}
          </Text>
        )}
        {paymentMethodId && (
          <>
            <Text>Payment method successfully created:</Text>
            <Text>{paymentMethodId}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  divider: {
    height: 44,
    width: 1,
    backgroundColor: colors.slate,
  },
  cardNumberInput: {
    height: 44,
    borderBottomColor: colors.slate,
    borderBottomWidth: 1,
    color: colors.slate,
  },
  cardCVCExpirationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderBottomColor: colors.slate,
    borderBottomWidth: 1,
    color: colors.slate,
    flex: 1,
  },
  errorText: {
    color: colors.red,
    fontSize: 14,
  },
});
