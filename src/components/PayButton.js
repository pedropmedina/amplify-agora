import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { API, graphqlOperation } from 'aws-amplify';
import { Notification, Message } from 'element-react';

import { getUser } from '../graphql/queries';
import { createOrder } from '../graphql/mutations';

import { history } from '../App';

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: 'pk_test_1BTHpc6CbVkeRlvLmPpMbiXL00aUiRt7mU'
};

const PayButton = ({ product, userAttributes }) => {
  const createShippingAddress = source => ({
    city: source.address_city,
    country: source.address_country,
    address_line1: source.address_line1,
    address_state: source.address_state,
    address_zip: source.address_zip
  });

  const getOwnerEmail = async ownerId => {
    try {
      const input = { id: ownerId };
      const { data } = await API.graphql(graphqlOperation(getUser, input));
      return data.getUser.email;
    } catch (error) {
      console.error(`Error fetching product owner's email ${error}`);
    }
  };

  const handleCharge = async token => {
    try {
      const ownerEmail = await getOwnerEmail(product.owner);
      console.log({ ownerEmail });

      const result = await API.post('orderfunction', '/charge', {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description
          },
          email: {
            customerEmail: userAttributes.email,
            ownerEmail,
            shipped: product.shipped
          }
        }
      });
      console.log({ result });
      if (result.charge.status === 'succeeded') {
        let shippingAddress = null;
        if (product.shipped) {
          shippingAddress = createShippingAddress(result.charse.source);
        }
        const input = {
          orderUserId: userAttributes.sub,
          orderProductId: product.id,
          shippingAddress
        };
        const order = await API.graphql(
          graphqlOperation(createOrder, { input })
        );
        console.log({ order });
        Notification({
          title: 'Success',
          message: `${result.message}`,
          type: 'success',
          duration: 3000
        });
        setTimeout(() => {
          history.push('/');
          Message({
            type: 'info',
            message: 'Check your verified email for order details',
            duration: 5000,
            showClose: true
          });
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      Notification.error({
        title: 'Error',
        message: `${error.message || 'Error processing order.'}`
      });
    }
  };

  return (
    <StripeCheckout
      token={handleCharge}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      email={userAttributes.email}
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
