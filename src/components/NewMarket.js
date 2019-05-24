// prettier-ignore
import React, { useState } from 'react';
import {
  Form,
  Button,
  Dialog,
  Input,
  Select,
  Notification
} from 'element-react';
import { API, graphqlOperation } from 'aws-amplify';

import { UserContext } from '../App';
import { createMarket } from '../graphql/mutations';

const TAGS = ['Arts', 'Technology', 'Craft', 'Entretainmet', 'Web Development'];

const NewMarket = props => {
  const [addMarketDialog, setAddMarketDialog] = useState(false);
  const [name, setName] = useState('');
  const [tags, setTags] = useState([]);
  const [options, setOptions] = useState([]);

  const handleAddMarket = async user => {
    try {
      setAddMarketDialog(false);
      const input = {
        name,
        tags,
        owner: user.username
      };
      const { data } = await API.graphql(
        graphqlOperation(createMarket, { input })
      );
      setName('');
      setOptions([]);
      setTags([]);
      console.log(`Created market: id ${data.createMarket.id}`);
    } catch (error) {
      console.error('Error adding new market', error);
      Notification.error({
        title: 'Error',
        message: `${error.message || 'Error adding market'} `
      });
    }
  };

  const handleFilterTags = query => {
    const options = TAGS.map(tag => ({ value: tag, label: tag })).filter(tag =>
      tag.label.toLowerCase().includes(query.toLowerCase())
    );
    setOptions(options);
  };

  return (
    <UserContext.Consumer>
      {({ user }) => (
        <>
          <div className="market-header">
            <h1 className="market-title">
              Create Your MarketPlace
              <Button
                type="text"
                icon="edit"
                className="market-title-button"
                onClick={() => setAddMarketDialog(true)}
              />
            </h1>

            <Form inline={true} onSubmit={props.onSearch}>
              <Form.Item>
                <Input
                  placeholder="Search Markets..."
                  icon="circle-cross"
                  value={props.searchTerm}
                  onIconClick={props.onClearSearch}
                  onChange={props.onSearchChange}
                />
              </Form.Item>
              <Button
                type="info"
                icon="search"
                onClick={props.onSearch}
                loading={props.isSearching}
              >
                Search
              </Button>
            </Form>
          </div>

          <Dialog
            title="Create New Market"
            visible={addMarketDialog}
            onCancel={() => setAddMarketDialog(false)}
            size="large"
            customClass="dialog"
          >
            <Dialog.Body>
              <Form labelPosition="top">
                <Form.Item label="Add Market Name">
                  <Input
                    placeholder="Market Name"
                    trim={true}
                    onChange={name => setName(name)}
                    value={name}
                  />
                </Form.Item>
                <Form.Item>
                  <Select
                    multiple={true}
                    filterable={true}
                    placeholder="Market Tags"
                    onChange={tags => setTags(tags)}
                    remoteMethod={handleFilterTags}
                    remote={true}
                  >
                    {options.map(option => (
                      <Select.Option
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Dialog.Body>

            <Dialog.Footer>
              <Button onClick={() => setAddMarketDialog(false)}>Cancel</Button>
              <Button
                type="primary"
                disabled={!name}
                onClick={() => handleAddMarket(user)}
              >
                Add
              </Button>
            </Dialog.Footer>
          </Dialog>
        </>
      )}
    </UserContext.Consumer>
  );
};

export default NewMarket;
