const fs = require('fs');

const WooCommerce = require('../config/woocommerce')
const connectToNeo4j = require('../config/dbconnection');

module.exports = {
  importdata: async (req, res) => {
    const data1 = fs.readFileSync('./datasets/products_sample_01.json', 'utf-8');
    const data2 = fs.readFileSync('./datasets/products_sample_02.json', 'utf-8');
    const products1 = JSON.parse(data1);
    const products2 = JSON.parse(data2);
    const products = [...products1, ...products2];
    const filteredProducts = products1.filter(product => product.views !== 0 && product.schema.image !== "");
    // Remove duplicates using a Set and spread operator 
    const uniqueProducts = Array.from(new Set(filteredProducts.map(p => JSON.stringify(p))))
      .map(p => JSON.parse(p));
    var { session, driver } = await connectToNeo4j();
    const createQuery = `
  CREATE (p:Product {id: $id,image: $image,meta_description: $meta_description,meta_title: $meta_title,name: $name,price: $price,
    product_features: $product_features,product_specification: $product_specification,sku: $sku
  })
  CREATE (b:Brand {name: $brandName})
  CREATE (m:Manufacturer {name: $manufacturerName})
  CREATE (p)-[:BELONGS_TO]->(b)
  CREATE (p)-[:MADE_BY]->(m)
`;
    //Import each product
    for (let i = 0; i < uniqueProducts.length && i < 10; i++) {
      const product = uniqueProducts[i];
      try {
        await session.run(createQuery, {
          id: product._id,
          image: product.schema.image,
          meta_description: product.meta_description,
          meta_title: product.meta_title,
          name: product.schema.name,
          price: product.views,
          product_features: JSON.stringify(product['product-features']),
          product_specification: JSON.stringify(product.specifications), // Convert to JSON string if needed
          sku: product.specifications?.['UNSPSC Code'] ?? null,
          brandName: product.schema.brand.name || '',
          manufacturerName: product.schema.manufacturer,
        });
      } catch (error) {
        console.error(`Failed to import product: ${product.meta_title}`, error);
      }
    }
    res.status(200).json({ Success: "successfully imported" })
  },
  addproduct: async (req, res) => {
    try {
      var { session, driver } = await connectToNeo4j();
      const query = `
        MATCH (p:Product)
        RETURN p.id AS id, p.image AS image,
               p.meta_description AS metaDescription, p.meta_title AS metaTitle,
               p.name AS name, p.price AS price,
               p.product_features AS productFeatures, p.product_specification AS productSpecification,
               p.title AS title, p.sku AS sku
        LIMIT 10;
    `;
      // Execute the query
      const result = await session.run(query);
      // Format the response as an array of objects
      const products = result.records.map(record => ({
        id: record.get('id'),
        image: record.get('image'),
        metaDescription: record.get('metaDescription'),
        title: record.get('title'),
        name: record.get('name'),
        price: record.get('price').toString(),
        productFeatures: record.get('productFeatures'),
        productSpecification: record.get('productSpecification'),
        sku: record.get('sku').toString(),
      }));
      await session.close();

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const wooProductData = {
          name: product.title || product.name,
          type: "simple",
          price: product.price + 20,
          regular_price: product.price,
          description: product.metaDescription,
          short_description: product.metaDescription,
          sku: product.sku,
          images: [
            {
              src: product.image
            }
          ]
        }
        try {
          await WooCommerce.post('products', wooProductData, (err, data, res) => {
            if (err) {
              console.log(`Error adding product with id ${product.id}: ${err}`);
            } else {
              console.log(`Product added with id ${product.id}`);
            }
          });
        } catch (error) {
          console.error(error);
        }
      }
      res.status(200).json({ success: "successfully added products" });
    } catch (error) {
      console.error(error);
    }
  },
  allproduct: async (req, res) => {
    try {
      // Use the WooCommerce API to fetch products
      WooCommerce.get('products', (err, data, response) => {
        if (err) {
          console.error('Error fetching products:', err);
          res.status(500).json({ error: 'Error fetching products' });
        } else {
          const products = JSON.parse(response);
          res.status(200).json(products);
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }

  },
  allorders: async (req, res) => {
    try {
      // Use the WooCommerce API to fetch products
      WooCommerce.get('orders', (err, data, response) => {
        if (err) {
          console.error('Error fetching products:', err);
          res.status(500).json({ error: 'Error fetching products' });
        } else {
          const products = JSON.parse(response);
          res.status(200).json(products);
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  },
  success: async (req, res) => {
    res.send("success to connect")
  },
  mainproduct: async (req, res) => {
    // Call connectToNeo4j within the function to get a new session and driver
    const { session, driver } = await connectToNeo4j();

    try {
      const query = `
    MATCH (p:Product)
    WHERE p.views IS NOT NULL AND p.image IS NOT NULL
    RETURN p.id AS id, p.page_title AS productName, p.image AS image, p.views AS views
    LIMIT 10;
`;
      // Execute the query
      const result = await session.run(query);
      // Format the response as an array of objects with the desired properties
      const products = result.records.map(record => {
        return {
          productName: record.get('productName'),
          image: record.get('image'),
          views: record.get('views').low,
          id: record.get('id').low
        };
      });
      res.status(200).json(products)
    } catch (error) {
      console.error('Error running query:', error);
      res.status(500).send('An error occurred while executing the query');
    } finally {
      // Close the session and the driver
      await session.close();
      await driver.close();
    }
  },
  compare: async (req, res) => {
    const dataset1String = fs.readFileSync('./datasets/products_sample_01.json', 'utf-8');
    const dataset2String = fs.readFileSync('./datasets/products_sample_02.json', 'utf-8');
    // Parse JSON strings into JavaScript objects
    const dataset1 = JSON.parse(dataset1String);
    const dataset2 = JSON.parse(dataset2String);
    // Step 2: Extract unique identifiers
    const uniqueIds1 = dataset1.map(item => item._id);
    const uniqueIds2 = dataset2.map(item => item.product_id);
    // Step 3: Compare the identifiers
    const commonIds = uniqueIds1.filter(id => uniqueIds2.includes(id));
    // Step 4: Output the common products
    const commonProducts = dataset1.filter(item => commonIds.includes(item._id));
    console.log(commonProducts);
  }
}