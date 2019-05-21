import React from 'react';
import { Elements, StripeProvider } from 'react-stripe-elements';

import CheckoutForm from './CkeckoutForm';

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: 'pk_test_1BTHpc6CbVkeRlvLmPpMbiXL00aUiRt7mU'
};

const Stripe = () => {
  return (
    <StripeProvider apiKey={stripeConfig.publishableAPIKey}>
      <div className="example">
        <h1>React Stripe Elements Example</h1>
        <Elements>
          <CheckoutForm />
        </Elements>
      </div>
    </StripeProvider>
  );
};

export default Stripe;
