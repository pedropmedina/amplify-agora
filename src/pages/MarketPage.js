import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Loading, Tabs, Icon } from 'element-react';
import { Link } from 'react-router-dom';

// import { getMarket } from '../graphql/queries';
import {
  onUpdateProduct,
  onDeleteProduct,
  onCreateProduct
} from '../graphql/subscriptions';

import NewProduct from '../components/NewProduct';
import Product from '../components/Product';

export const getMarket = `query GetMarket($id: ID!) {
  getMarket(id: $id) {
    id
    name
    products {
      items {
        id
        description
        file {
          key
        }
        price
        shipped
        owner
        createdAt
      }
      nextToken
    }
    tags
    owner
    createdAt
  }
}
`;

const MarketPage = props => {
  const [market, setMarket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarketOwner, setIsMarketOwner] = useState(false);

  useEffect(() => {
    (async function handleMarket() {
      try {
        const input = { id: props.marketId };
        const { data } = await API.graphql(graphqlOperation(getMarket, input));
        setMarket(data.getMarket);
        setIsLoading(false);
      } catch (error) {
        const { errors } = error;
        console.log('Error:', errors[0].message);
      }
    })();
  }, []);

  // use effect to update based on changes to market
  useEffect(() => {
    (function checkMarketOwner() {
      const { user } = props;
      // compare current user with that of the market
      if (user && market) setIsMarketOwner(user.username === market.owner);
    })();

    // subscribe to CRUD operations in order to update UI
    const createProductListener = API.graphql(
      graphqlOperation(onCreateProduct)
    ).subscribe({
      next: productData => {
        const createdProduct = productData.value.data.onCreateProduct;
        setMarket(prevMarket => {
          const prevProducts = prevMarket.products.items.filter(
            product => product.id !== createdProduct.id
          );
          const updatedProducts = [createdProduct, ...prevProducts];
          const marketCopy = { ...prevMarket };
          marketCopy.products.items = updatedProducts;
          return marketCopy;
        });
      }
    });

    const updateProductListener = API.graphql(
      graphqlOperation(onUpdateProduct)
    ).subscribe({
      next: productData => {
        const updatedProduct = productData.value.data.onUpdateProduct;
        setMarket(prevMarket => {
          const updatedItems = prevMarket.products.items.map(product =>
            product.id === updatedProduct.id ? updatedProduct : product
          );
          const marketCopy = { ...prevMarket };
          marketCopy.products.items = updatedItems;
          return marketCopy;
        });
      }
    });

    const deleteProductListener = API.graphql(
      graphqlOperation(onDeleteProduct)
    ).subscribe({
      next: productData => {
        const deletedProduct = productData.value.data.onDeleteProduct;
        const updatedProducts = market.products.items.filter(
          item => item.id !== deletedProduct.id
        );
        const marketCopy = { ...market };
        marketCopy.products.items = updatedProducts;
        setMarket(marketCopy);
      }
    });

    // unsubscribe listeners
    return () => {
      createProductListener.unsubscribe();
      updateProductListener.unsubscribe();
      deleteProductListener.unsubscribe();
    };
  }, [market]);

  return isLoading ? (
    <Loading fullscreen={true} />
  ) : (
    <>
      {/*  Back Button  */}
      <Link className="link" to="/">
        Back to Market List
      </Link>

      {/* Market MetaData */}
      <span className="items-center pt-2">
        <h2 className="mb-mr">{market.name}</h2>-{market.owner}
      </span>
      <div className="items-center pt-2">
        <span style={{ color: 'var(--lightSquidInk)', paddingBottom: '1em' }}>
          <Icon name="date" className="icon" />
          {market.createdAt}
        </span>
      </div>

      {/* New Product */}
      <Tabs type="border-card" value={isMarketOwner ? '1' : '2'}>
        {isMarketOwner && (
          <Tabs.Pane
            label={
              <>
                <Icon name="plus" className="icon" />
                Add Product
              </>
            }
            name="1"
          >
            <NewProduct marketId={props.marketId} />
          </Tabs.Pane>
        )}
        {/* Product List  */}
        <Tabs.Pane
          label={
            <>
              <Icon name="menu" className="icon" />
              Products ({market.products.items.length})
            </>
          }
          name="2"
        >
          <div className="product-list">
            {market.products.items.map(product => (
              <Product key={product.id} product={product} />
            ))}
          </div>
        </Tabs.Pane>
      </Tabs>
    </>
  );
};

export default MarketPage;
