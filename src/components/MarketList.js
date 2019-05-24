import React from 'react';
import { graphqlOperation } from 'aws-amplify';
import { Connect } from 'aws-amplify-react';
import { Loading, Card, Icon, Tag } from 'element-react';
import { Link } from 'react-router-dom';

import Error from './Error';
import { listMarkets } from '../graphql/queries';
import { onCreateMarket } from '../graphql/subscriptions';

const MarketList = ({ searchResults }) => {
  // Update local store to display latest markets.
  // This is using Apollo Client underneath which uses the update function to update the cache
  const onNewMarket = (prevQuery, newData) => {
    let updatedQuery = { ...prevQuery };
    const updatedMarketList = [
      newData.onCreateMarket,
      ...prevQuery.listMarkets.items
    ];
    updatedQuery.listMarkets.items = updatedMarketList;
    return updatedQuery;
  };

  return (
    <Connect
      query={graphqlOperation(listMarkets)}
      subscription={graphqlOperation(onCreateMarket)}
      onSubscriptionMsg={onNewMarket}
    >
      {({ data, loading, errors }) => {
        if (errors.length > 0) return <Error errors={errors} />;
        if (loading || !data.listMarkets) return <Loading fullscreen={true} />;
        // Set the current results to be either what the user searches or all the existing markets
        const markets =
          searchResults.length > 0 ? searchResults : data.listMarkets.items;

        return (
          <>
            {searchResults.length > 0 ? (
              <h2 className="text-green">
                <Icon type="success" name="check" className="icon" />
                {searchResults.length} Results
              </h2>
            ) : (
              <h2 className="header">
                <img
                  src="https://icon.now.sh/store_mall_directory/527FFF"
                  alt="Store Icon"
                  className="large-icon"
                />
                Markets
              </h2>
            )}
            {markets.map(market => (
              <div key={market.id} className="my-2">
                <Card
                  bodyStyle={{
                    padding: '1em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span className="flex">
                      <Link className="link" to={`/markets/${market.id}`}>
                        {market.name}
                      </Link>
                      <span style={{ color: 'var(--darkAmazonOrange)' }}>
                        {market.products.items && market.products.items.length}
                      </span>
                      <img
                        src="https://icon.now.sh/shopping_cart/f60"
                        alt="Shopping Cart"
                      />
                    </span>
                    <div style={{ color: 'var(--lightSquidInk)' }}>
                      {market.owner}
                    </div>
                  </div>
                  <div>
                    {market.tags &&
                      market.tags.map(tag => (
                        <Tag key={tag} type="danger" className="mx-1">
                          {tag}
                        </Tag>
                      ))}
                  </div>
                </Card>
              </div>
            ))}
          </>
        );
      }}
    </Connect>
  );
};

export default MarketList;
