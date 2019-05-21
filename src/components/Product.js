// prettier-ignore
import React, {useState} from "react";
import { S3Image } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import {
  Notification,
  Popover,
  Button,
  Dialog,
  Card,
  Form,
  Input,
  Radio
} from 'element-react';

import PayButton from './PayButton';

import { updateProduct, deleteProduct } from '../graphql/mutations';
import { convertCentsToDollars, convertDollarsToCents } from '../utils/index';
import { UserContext } from '../App';

const Product = props => {
  const [updatedProductDialog, setUpdateProductDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [shipped, setShipped] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);

  const { product } = props;

  const handleUpdateProduct = async productId => {
    try {
      setUpdateProductDialog(false);
      const input = {
        id: productId,
        description,
        shipped,
        price: convertDollarsToCents(price)
      };
      const result = await API.graphql(
        graphqlOperation(updateProduct, { input })
      );
      console.log(result);
      Notification({
        title: 'success',
        message: 'Product successfully updated!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const handleDeleteProduct = async productId => {
    try {
      setDeleteProductDialog(false);
      const input = {
        id: productId
      };
      await API.graphql(graphqlOperation(deleteProduct, { input }));
      Notification({
        title: 'Success',
        message: 'Product successfully deleted',
        type: 'success'
      });
    } catch (error) {
      console.log(`Error deleting product with id ${product.id}`, error);
    }
  };
  return (
    <UserContext.Consumer>
      {({ user }) => {
        const isProductOwner = user && user.attributes.sub === product.owner;
        return (
          <div className="card-container">
            <Card bodyStyle={{ padding: 0, minWidth: '200px' }}>
              <S3Image
                imgKey={product.file.key}
                theme={{
                  photoImg: { maxWidth: '100%', maxHeight: '100%' }
                }}
              />
              <div className="card-body">
                <h3 className="m-0">{product.description}</h3>
                <div className="items-center">
                  <img
                    src={`https://icon.now.sh/${
                      product.shipped ? 'markunread_mailbox' : 'mail'
                    }`}
                    alt="Shipping Icon"
                    className="icon"
                  />
                  {product.shipped ? 'Shipped' : 'Emailed'}
                </div>
                <div className="text-rightmalbox">
                  <span className="mx-1">
                    ${convertCentsToDollars(product.price)}
                  </span>
                  {!isProductOwner && (
                    <PayButton product={product} user={user} />
                  )}
                </div>
              </div>
            </Card>
            {/* Updatte / Delete Product Buttons */}
            <div className="text-center">
              {isProductOwner && (
                <>
                  <Button
                    type="warning"
                    icon="edit"
                    className="m-1"
                    onClick={() => {
                      setUpdateProductDialog(true);
                      setDescription(product.description);
                      setPrice(convertCentsToDollars(product.price));
                      setShipped(product.shipped);
                    }}
                  />
                  <Popover
                    placement="top"
                    width="160"
                    trigger="click"
                    visible={deleteProductDialog}
                    content={
                      <>
                        <p>Do you want to delete this?</p>
                        <div className="text-right">
                          <Button
                            size="mini"
                            type="text"
                            className="m-1"
                            onClick={() => setDeleteProductDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="primary"
                            size="mini"
                            className="m-1"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Confirm
                          </Button>
                        </div>
                      </>
                    }
                  >
                    <Button
                      type="danger"
                      icon="delete"
                      onClick={setDeleteProductDialog(true)}
                    />
                  </Popover>
                </>
              )}
            </div>
            {/* Update Product Dialog */}
            <Dialog
              title="Update Product"
              size="large"
              customClass="dialog"
              visible={updatedProductDialog}
              onCancel={() => {
                setUpdateProductDialog(false);
              }}
            >
              <Dialog.Body>
                <Form labelPosition="top">
                  <Form.Item label="Update Description">
                    <Input
                      icon="information"
                      placeholder="Product Description"
                      value={description}
                      trim={true}
                      onChange={description => setDescription(description)}
                    />
                  </Form.Item>
                  <Form.Item label="Update Price">
                    <Input
                      type="number"
                      icon="plus"
                      placeholder="Price ($USD)"
                      value={price}
                      onChange={price => setPrice(price)}
                    />
                  </Form.Item>
                  <Form.Item label="Update shipping">
                    <div className="text-center">
                      <Radio
                        value="true"
                        checked={shipped === true}
                        onChange={() => setShipped(true)}
                      >
                        Shipped
                      </Radio>
                      <Radio
                        value="false"
                        checked={shipped === false}
                        onChange={() => setShipped(false)}
                      >
                        Emailed
                      </Radio>
                    </div>
                  </Form.Item>
                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={() => setUpdateProductDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={() => handleUpdateProduct(product.id)}
                >
                  Update
                </Button>
              </Dialog.Footer>
            </Dialog>
          </div>
        );
      }}
    </UserContext.Consumer>
  );
};

export default Product;
