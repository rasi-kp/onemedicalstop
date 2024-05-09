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

    // Remove duplicates using a Set and spread operator (based on product title, for example)
    const uniqueProducts = Array.from(new Set(products.map(p => JSON.stringify(p))))
      .map(p => JSON.parse(p));
    // Define the Cypher query to create nodes and relationships
    const createQuery = `
CREATE (p:Product {id: $id, title: $title, price: $price})
CREATE (b:Brand {name: $brandName})
CREATE (m:Manufacturer {name: $manufacturerName})
CREATE (p)-[:BELONGS_TO]->(b)
CREATE (p)-[:MADE_BY]->(m)
`;
    // Import each product
    for (const product of uniqueProducts) {
      const { title, price, brand, manufacturer } = product;

      try {
        await session.run(createQuery, {
          id: product.id,
          title,
          price,
          brandName: brand,
          manufacturerName: manufacturer,
        });
      } catch (error) {
        console.error(`Failed to import product: ${product.title}`, error);
      }
    }
    // Perform any other cleaning operations as needed
    res.status(200).json(uniqueProducts)
  },
  addproduct: async (req, res) => {
    var { session, driver } = await connectToNeo4j();
    // Define the Cypher query to fetch products
    const query = `
        MATCH (p:Product)
        WHERE p.views IS NOT NULL AND p.image IS NOT NULL
        RETURN p.created_at AS createdAt, p.id AS id, p.image AS image,
               p.meta_description AS metaDescription, p.meta_title AS metaTitle,
               p.name AS name, p.page_title AS pageTitle, p.price AS price,
               p.product_features AS productFeatures, p.product_specification AS productSpecification,
               p.title AS title, p.views AS views
        LIMIT 5;
    `;
    // Execute the query
    const result = await session.run(query);
    // Format the response as an array of objects
    const products = result.records.map(record => ({
      createdAt: record.get('createdAt'),
      id: record.get('id').toNumber(),
      image: record.get('image'),
      metaDescription: record.get('metaDescription'),
      metaTitle: record.get('metaTitle'),
      name: record.get('name'),
      pageTitle: record.get('pageTitle'),
      price: parseFloat(record.get('price')),
      productFeatures: record.get('productFeatures'),
      productSpecification: record.get('productSpecification'),
      title: record.get('title'),
      views: record.get('views').toNumber()
    }));
    // Close the Neo4j session
    await session.close();
    //   const data = {
    //     name: "Premium Quality",
    //     type: "simple",
    //     regular_price: "21.99",
    //     description: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas...",
    //     short_description: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
    //     categories: [
    //         { id: 9 },
    //         { id: 14 }
    //     ],
    //     images: [
    //         { src: "http://demo.woothemes.com/woocommerce/wp-content/uploads/sites/56/2013/06/T_2_front.jpg" },
    //         { src: "http://demo.woothemes.com/woocommerce/wp-content/uploads/sites/56/2013/06/T_2_back.jpg" }
    //     ]
    // };
    for (const product of products) {
      // Prepare data for WooCommerce API
      const wooProductData = {
        name: product.name,
        type: 'medical',
        regular_price: product.price.toString(),
        description: product.metaDescription,
        short_description: product.productFeatures,
        images: [
          {
            src: product.image
          }
        ]
      };
      // Add product to WooCommerce
      WooCommerce.post('products', wooProductData, (err, data, res) => {
        if (err) {
          console.error(`Error adding product with id ${product.id}:`, err);
        } else {
          console.log(`Product added with id ${product.id}`);
        }
      });
    }
    res.status(200).json({ success: "successfully added products" });
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
  success:async(req,res)=>{
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
}