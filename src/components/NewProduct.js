// prettier-ignore
import React, {useState} from "react";
import { PhotoPicker } from 'aws-amplify-react';
import { Storage, Auth, API, graphqlOperation } from 'aws-amplify';
import {
  Form,
  Button,
  Input,
  Notification,
  Radio,
  Progress
} from 'element-react';

import { convertDollarsToCents } from '../utils';
import aws_exports from '../aws-exports';
import { createProduct } from '../graphql/mutations';

const NewProduct = props => {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [shipped, setShipped] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [percentUploaded, setPercentUploaded] = useState('');

  const handleAddProduct = async () => {
    try {
      console.log({ description, price, shipped, imagePreview, image });

      setIsUploading(true);

      const visibility = 'public';
      const { identityId } = await Auth.currentCredentials();
      const filename = `/${visibility}/${identityId}/${Date.now()}-${
        image.name
      }`;
      const uploadedFile = await Storage.put(filename, image.file, {
        contentType: image.type,
        progressCallback: progress => {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
          const percentUploaded = Math.round(
            (progress.loaded / progress.total) * 100
          );
          setPercentUploaded(percentUploaded);
        }
      });
      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_project_region
      };

      const input = {
        productMarketId: props.marketId,
        description,
        shipped,
        price: convertDollarsToCents(price),
        file,
        everyoneReadAccess: ['Everyone']
      };

      const result = await API.graphql(
        graphqlOperation(createProduct, { input })
      );

      console.log('Created product', result);
      Notification({
        title: 'Success',
        message: 'Product successfully created',
        type: 'success'
      });

      // reset state
      setDescription('');
      setPrice('');
      setShipped(false);
      setImagePreview('');
      setImage('');
      setIsUploading(false);
    } catch (error) {
      console.error('Error adding product', error);
    }
  };

  return (
    <div className="flex-center">
      <h2 className="header">Add New Product</h2>
      <div>
        <Form className="market-header">
          <Form.Item label="Add Product Description">
            <Input
              type="text"
              icon="information"
              placeholder="description"
              value={description}
              onChange={description => setDescription(description)}
            />
          </Form.Item>
          <Form.Item label="Set Product Price">
            <Input
              type="number"
              icon="plus"
              placeholder="Price ($USD)"
              value={price}
              onChange={price => setPrice(price)}
            />
          </Form.Item>
          <Form.Item label="Is the Product Shipped or Email to the Customer">
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
          {imagePreview && (
            <img
              className="image-preview"
              src={imagePreview}
              alt="Product Preview"
            />
          )}
          {percentUploaded > 0 && (
            <Progress
              type="circle"
              className="progress"
              percentage={percentUploaded}
            />
          )}
          <PhotoPicker
            title="Product Image"
            preview="hidden"
            onLoad={url => setImagePreview(url)}
            onPick={file => setImage(file)}
            theme={{
              formContainer: {
                margin: 0,
                padding: '0.8em'
              },
              formSection: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              },
              sectionBody: {
                margin: 0,
                width: '250px'
              },
              sectionHeader: {
                padding: '0.2em',
                color: 'var(--darkAmazonOrange)'
              },
              photoPickerButton: {
                display: 'none'
              }
            }}
          />
          <Form.Item>
            <Button
              disabled={!image || !description || !price || isUploading}
              type="primary"
              onClick={handleAddProduct}
              loading={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Add Product'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NewProduct;
