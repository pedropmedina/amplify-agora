// prettier-ignore
import React, { useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import {
  Table,
  Button,
  Notification,
  MessageBox,
  Message,
  Tabs,
  Icon,
  Form,
  Dialog,
  Input,
  Card,
  Tag
} from 'element-react';

import { convertCentsToDollars } from '../utils';

const getUser = `query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    username
    email
    registered
    orders(sortDirection: DESC) {
      items {
        id
        createdAt
        product {
          id
          owner
          price
          createdAt
          description
        }
        shippingAddress {
          city
          country
          address_line1
          address_state
          address_zip
        }
      }
      nextToken
    }
  }
}
`;

const ProfilePage = ({ user, userAttributes }) => {
  const [orders, setOrders] = useState([]);
  const [columns, setColumns] = useState([
    { prop: 'name', width: '150' },
    { prop: 'value', width: '330' },
    {
      prop: 'tag',
      width: '150',
      render: row => {
        if (row.name === 'Email') {
          const emailVerified = userAttributes.email_verified;
          return emailVerified ? (
            <Tag type="success">Verified</Tag>
          ) : (
            <Tag type="danger">Unverified</Tag>
          );
        }
      }
    },
    {
      prop: 'operations',
      render: row => {
        switch (row.name) {
          case 'Email':
            return (
              <Button type="info" size="small">
                Edit
              </Button>
            );
          case 'Delete Profile':
            return (
              <Button type="danger" size="small">
                Delete
              </Button>
            );
          default:
            return;
        }
      }
    }
  ]);

  useEffect(() => {
    if (userAttributes) {
      getUserOrders(userAttributes.sub);
    }
  }, []);

  const getUserOrders = async userId => {
    const input = { id: userId };
    const { data } = await API.graphql(graphqlOperation(getUser, input));
    setOrders(data.getUser.orders.items);
  };

  return (
    userAttributes && (
      <>
        <Tabs activeName="1" className="profile-tabs">
          <Tabs.Pane
            label={
              <>
                <Icon name="document" className="icon" />
                Summary
              </>
            }
            name="1"
          >
            <h2 className="header">Profile Summary</h2>
            <Table
              columns={columns}
              data={[
                { name: 'Your Id', value: userAttributes.sub },
                { name: 'Username', value: user.username },
                { name: 'Email', value: userAttributes.email },
                { name: 'Phone Number', value: userAttributes.phone_number },
                { name: 'Delete Profile', value: 'Sorry to see you go' }
              ]}
              showHeader={false}
              rowClassName={row =>
                row.name === 'Delete Profile' && 'delete-profile'
              }
            />
          </Tabs.Pane>
          <Tabs.Pane
            label={
              <>
                <Icon name="message" className="icon" />
                Orders
              </>
            }
            name="2"
          >
            <h2 className="header">Order History</h2>
            {orders.map(order => (
              <div className="mb-1" key={order.id}>
                <Card>
                  <pre>
                    <p>Order Id: {order.id}</p>
                    <p>Product Description: {order.product.description}</p>
                    <p>Price: ${convertCentsToDollars(order.product.price)}</p>
                    <p>Purchased on {order.createdAt}</p>
                    {order.shippingAddress && (
                      <>
                        Shipping Address
                        <div className="ml-2">
                          <p>{order.shippingAddress.address_line1}</p>
                          <p>{order.shippingAddress.city}</p>
                          <p>{order.shippingAddress.address_state}</p>
                          <p>{order.shippingAddress.country}</p>
                          <p>{order.shippingAddress.zip}</p>
                        </div>
                      </>
                    )}
                  </pre>
                </Card>
              </div>
            ))}
          </Tabs.Pane>
        </Tabs>
      </>
    )
  );
};

export default ProfilePage;
