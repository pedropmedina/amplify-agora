import React, { useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';

import { searchMarkets } from '../graphql/queries';

import NewMarket from '../components/NewMarket';
import MarketList from '../components/MarketList';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = searchTerm => setSearchTerm(searchTerm);

  const handleClearSearch = () => {
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleSearch = async event => {
    try {
      event.preventDefault();
      setIsSearching(true);
      const { data } = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: searchTerm } },
              { tags: { match: searchTerm } },
              { owner: { match: searchTerm } }
            ]
          },
          sort: {
            field: 'createdAt',
            direction: 'desc'
          }
        })
      );

      setSearchResults(data.searchMarkets.items);
      setIsSearching(false);

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <NewMarket
        searchTerm={searchTerm}
        isSearching={isSearching}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        onSearch={handleSearch}
      />
      <MarketList searchResults={searchResults} />
    </>
  );
};

export default HomePage;
