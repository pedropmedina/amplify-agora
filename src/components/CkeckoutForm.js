import React, { useState } from 'react';
import { CardElement, injectStripe } from 'react-stripe-elements';

const prices = {
  banana: 150,
  cucumber: 100
};

const CheckoutForm = props => {
  const [cart, setCart] = useState({ banana: 0, cucumber: 0 });
  const [fetching, setFetching] = useState(false);

  console.log('checkout form props ---> ', props);

  const handleSubmission = () => {
    console.log('payment submitted');
  };

  return (
    <div className="checkout">
      <p>Would you like to complete the purchase?</p>
      <form onSubmit={handleSubmission}>
        <div>
          Banana{' '}
          {(prices.banana / 100).toLocaleString('en-US', {
            style: 'currency',
            currency: 'usd'
          })}
          <div>
            <button
              name="banana"
              value={-1}
              onClick={() => console.log('more banana')}
              type="button"
            >
              +
            </button>
            <button
              name="banana"
              value={-1}
              onClick={() => console.log('less banana')}
              disabled={cart.banana <= 0}
              type="button"
            >
              -
            </button>
          </div>
        </div>
        <div>
          Cucumber{' '}
          {(prices.cucumber / 100).toLocaleString('en-US', {
            style: 'currency',
            currency: 'usd'
          })}
          <div>
            <button
              name="cucumber"
              value={-1}
              onClick={() => console.log('more cucumber')}
              type="button"
            >
              +
            </button>
            <button
              name="cucumber"
              value={-1}
              onClick={() => console.log('less cucumber')}
              disabled={cart.cucumber <= 0}
              type="button"
            >
              -
            </button>
          </div>
        </div>
        <button onClick={() => console.log('reset cart')} type="button">
          Reset cart
        </button>
        <div
          style={{
            width: '450px',
            margin: '10px',
            padding: '5px',
            border: '2px solid green',
            borderRadius: '10px'
          }}
        >
          <CardElement style={{ base: { fontSize: '18px' } }} />
        </div>
        {!fetching ? (
          <button
            type="submit"
            disabled={cart.banana === 0 && cart.cucumber === 0}
          >
            Purchase
          </button>
        ) : (
          'Purchasing...'
        )}
        Price:{' '}
        {(
          (cart.banana * prices.banana + cart.cucumber * prices.cucumber) /
          100
        ).toLocaleString('en-US', { style: 'currency', currency: 'usd' })}
      </form>
    </div>
  );
};

export default injectStripe(CheckoutForm);
