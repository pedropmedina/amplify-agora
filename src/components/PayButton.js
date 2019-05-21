import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { API } from 'aws-amplify';
// import { Notification, Message } from "element-react";

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: 'pk_test_1BTHpc6CbVkeRlvLmPpMbiXL00aUiRt7mU'
};

const PayButton = ({ product, user }) => {
  const handleCharge = async token => {
    try {
      const result = await API.post('orderfunction', '/charge', {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description
          }
        }
      });
      console.log({ result });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <StripeCheckout
      token={handleCharge}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      email={user.attributes.email}
      name={product.description}
      amount={product.price}
      billingAddress={product.shipped}
      shippingAddress={product.shipped}
      locale="auto"
      allowRememberMe={false}
    />
  );
};

export default PayButton;
