const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
// const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const compression = require('compression');
dotenv.config(path.join(__dirname, '.env'));

const cors = require('cors');

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};



// AWS.config.update({
//     region: 'eu-north-1',
// });

// const s3 = new AWS.S3();
// const pool = new Pool({
//     user: 'beatstore_mpke_user',
//     host: 'dpg-cu37agpu0jms73dlu8d0-a.frankfurt-postgres.render.com',
//     database: 'beatstore_mpke',
//     password: 'FYGYF6TlFeeks8cUEgiHlv9Et6HdSrRD',
//     port: 5432,
//     ssl: {
//         rejectUnauthorized: false,
//     },
// });

AWS.config.update({
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3(
  {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  }
);
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

app.use(cors(corsOptions));

// Enable compression
app.use(compression());

// Your other middlewares and routes here
app.use(express.static('dist')); // Vite's static files


const baseURL = process.env.VITE_API_BASE_URL;
// Middleware
// app.use(cors());
// app.use(cors());
app.use(express.json());

// Setup Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


const authenticateJWT = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Get the token

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Fetch roles from the user_roles table
    try {
      const client = await pool.connect();
      const query = 'SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1';
      const result = await client.query(query, [user.id]);
      client.release();

      // Extract role name from query result
      const role = result.rows.length > 0 ? result.rows[0].name : null;

      // Add role information to the user object in the request
      req.user = { ...user, role };
      next();
    } catch (error) {
      console.error('Error fetching user roles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};

// Registration route
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    
    // Start a transaction to ensure both operations succeed
    await client.query('BEGIN');
    
    // Insert user into users table
    const insertQuery = 'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id';
    const values = [email, hashedPassword, name];
    const result = await client.query(insertQuery, values);
    const userId = result.rows[0].id;

    // Get the role_id for 'user'
    const roleResult = await client.query(
      'SELECT id FROM roles WHERE name = $1',
      ['user']
    );
    const roleId = roleResult.rows[0].id;

    // Insert the user-role association
    const userRoleQuery = 'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)';
    await client.query(userRoleQuery, [userId, roleId]);

    // Commit the transaction
    await client.query('COMMIT');

    client.release();

    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (error) {
    console.error('Error registering user:', error);

    // Rollback in case of error
    await client.query('ROLLBACK');
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const client = await pool.connect();
    const query = `
      SELECT u.id, u.email, u.name, u.password, r.name AS role
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.email = $1
    `;
    const result = await client.query(query, [email]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Log to ensure the user data and role are retrieved
    console.log('Fetched user:', user);

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT including user info and role
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    // Send token to user
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to upload beat
app.post(
  '/api/upload-beat',
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'mp3', maxCount: 1 }]),
  async (req, res) => {
    const { title, bpm, musical_key, tags, authors, sample } = req.body; // 'authors' is a comma-separated string of author names
    const { image, mp3 } = req.files;

    if (!title || !bpm || !musical_key || !tags || !authors || !image || !mp3) {
      return res.status(400).json({ error: 'Missing fields or files' });
    }

    try {
      const client = await pool.connect();

      // Upload files to S3
      const imageFileName = image[0].originalname.replace(/\s+/g, '_');
      const mp3FileName = mp3[0].originalname.replace(/\s+/g, '_');

      const imageParams = {
        Bucket: 'beatstore-bucket/images',
        Key: `${Date.now()}-${imageFileName}`,
        Body: image[0].buffer,
        ContentType: image[0].mimetype,
      };
      const mp3Params = {
        Bucket: 'beatstore-bucket/mp3',
        Key: `${Date.now()}-${mp3FileName}`,
        Body: mp3[0].buffer,
        ContentType: mp3[0].mimetype,
      };

      const [imageUploadResult, mp3UploadResult] = await Promise.all([
        s3.upload(imageParams).promise(),
        s3.upload(mp3Params).promise(),
      ]);

      // Insert beat
      const formattedTags = `{${tags.split(',').map((tag) => tag.trim()).join(',')}}`;
      const beatResult = await client.query(
        `INSERT INTO beats (title, bpm, musical_key, tags, mp3_url, image_url, sample)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [title, bpm, musical_key, formattedTags, mp3UploadResult.Location, imageUploadResult.Location, sample]
      );
      const beatId = beatResult.rows[0].id;

      // Handle authors: split, trim, and insert if not already present
      const authorNames = authors.split(',').map((name) => name.trim()).filter((name) => name.length > 0); // Ensure no empty author names
      for (const author of authorNames) {
        let authorId;

        // Check if the author exists already
        const existingAuthorResult = await client.query(
          `SELECT id FROM authors WHERE name = $1`,
          [author]
        );

        if (existingAuthorResult.rows.length > 0) {
          authorId = existingAuthorResult.rows[0].id; // Use existing author ID
        } else {
          // Insert new author
          const newAuthorResult = await client.query(
            `INSERT INTO authors (name) VALUES ($1) RETURNING id`,
            [author]
          );
          authorId = newAuthorResult.rows[0].id;
        }

        // Associate beat with author
        await client.query(
          `INSERT INTO beat_author (beat_id, author_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [beatId, authorId]
        );
      }

      client.release();
      res.status(200).json({ message: 'Beat uploaded successfully', beatId });
    } catch (error) {
      console.error('Error uploading beat:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);
// Route to fetch all beats and generate presigned URLs using Signature v4
app.get('/api/beats', async (req, res) => {
  try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM beats');
      client.release();

      // Generate presigned URLs for each beat using Signature v4
      const beatsWithPresignedUrls = await Promise.all(
          result.rows.map(async (beat) => {
              const mp3Params = {
                  Bucket: 'beatstore-bucket/mp3',  // Correct bucket name
                  Key: encodeURIComponent(beat.mp3_url.split('/').pop()),
                  Expires: 60 * 60, // URL expires in 1 hour
              };

              const imageParams = {
                  Bucket: 'beatstore-bucket/images',  // Correct bucket name
                  Key: encodeURIComponent(beat.image_url.split('/').pop()),
                  Expires: 60 * 60, // URL expires in 1 hour
              };

              // Get presigned URLs for both MP3 and Image using Signature V4
              const mp3Url = s3.getSignedUrl('getObject', mp3Params);
              const imageUrl = s3.getSignedUrl('getObject', imageParams);

              return {
                  ...beat,
                  mp3_url: mp3Url,
                  image_url: imageUrl,
              };
          })
      );

      res.status(200).json(beatsWithPresignedUrls);
  } catch (error) {
      console.error('Error fetching beats:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/beats/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
      return res.status(400).json({ error: 'Beat ID is required' });
  }

  try {
      const client = await pool.connect();
      
      // Query to get beat and aggregate author names
      const result = await client.query(`
          SELECT 
              beats.*,
              json_agg(authors.name) AS authors
          FROM 
              beats
          JOIN 
              beat_author ON beats.id = beat_author.beat_id
          JOIN
              authors ON beat_author.author_id = authors.id
          WHERE 
              beats.id = $1
          GROUP BY 
              beats.id
      `, [id]);
      
      client.release();

      // If no beat is found, return a 404
      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Beat not found' });
      }

      const beat = result.rows[0];

      // Generate presigned URLs for the MP3 and image
      const mp3Params = {
          Bucket: 'beatstore-bucket/mp3', // Your bucket and directory for MP3 files
          Key: decodeURIComponent(beat.mp3_url.split('/').pop()), // Extract the key from the URL
          Expires: 60 * 60, // 1 hour expiration
      };

      const imageParams = {
          Bucket: 'beatstore-bucket/images', // Your bucket and directory for image files
          Key: decodeURIComponent(beat.image_url.split('/').pop()), // Extract the key from the URL
          Expires: 60 * 60, // 1 hour expiration
      };

      const mp3Url = s3.getSignedUrl('getObject', mp3Params);
      const imageUrl = s3.getSignedUrl('getObject', imageParams);

      // Respond with the beat data and presigned URLs
      res.status(200).json({
          id: beat.id,
          title: beat.title,
          bpm: beat.bpm,
          musical_key: beat.musical_key,
          tags: beat.tags,
          mp3_url: mp3Url,
          image_url: imageUrl,
          authors: beat.authors, // List of authors
          sample: beat.sample,
      });
  } catch (error) {
      console.error('Error fetching beat:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to submit an opinion for a specific beat
app.post('/api/beats/:id/opinions', authenticateJWT, async (req, res) => {
  const { content, author } = req.body; // Include `author`
  const { id } = req.params; // Beat ID
  const { user } = req; // Authenticated user

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO opinions (content, beat_id, user_id, name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, content, created_at, name`,
      [content, id, user?.id || null, author || 'Anon'] // Use `Anon` as default name
    );

    res.status(201).json(result.rows[0]); // Send full opinion data as response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding opinion' });
  }
});

app.get('/api/beats/:id/opinions', async (req, res) => {
  const { id } = req.params; // Beat ID

  try {
    const result = await pool.query('SELECT * FROM opinions WHERE beat_id = $1', [id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching opinions' });
  }
});


// DELETE /api/beats/:id/opinions/:opinionId
app.delete('/api/beats/:id/opinions/:opinionId', authenticateJWT, async (req, res) => {
  const { opinionId } = req.params;
  const { user } = req; // Authenticated user

  try {
    // Check if the opinion belongs to the user
    const result = await pool.query(
      'SELECT * FROM opinions WHERE id = $1 AND user_id = $2',
      [opinionId, user.id]
    );

    if (result.rowCount === 0 && user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own opinions' });
    }

    await pool.query('DELETE FROM opinions WHERE id = $1', [opinionId]);
    res.status(200).json({ message: 'Opinion deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting opinion' });
  }
});


app.get('/api/tags', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query(`
        SELECT DISTINCT unnest(tags) AS tag 
        FROM beats
      `);
      client.release();
  
      const tags = result.rows.map(row => ({ value: row.tag, label: row.tag }));
      res.status(200).json(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
app.get('/api/authors', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id, name FROM authors ORDER BY name ASC');
    client.release();

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/licenses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM licenses');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching licenses:', err);
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
});

app.post('/api/carts', authenticateJWT, async (req, res) => {
  const { beat_id, license_id } = req.body;

  if (!beat_id || !license_id) {
      return res.status(400).json({ message: 'beat_id and license_id are required' , test: req.body});
  }

  try {
      // Check if the user already has a cart entry for the specific beat and license
      const existing = await pool.query(
          'SELECT * FROM carts WHERE user_id = $1 AND beat_id = $2 AND license_id = $3 AND order_id IS NULL',
          [req.user.id, beat_id, license_id]
      );

      // If the item is already in the cart, return a conflict response
      if (existing.rows.length > 0) {
          console.log(existing.rows);
          return res.status(409).json({ message: 'This item is already in your cart' });
      }

      // Insert the new cart item if it doesn't exist already
      await pool.query(
          'INSERT INTO carts (user_id, beat_id, license_id, order_id) VALUES ($1, $2, $3, NULL)',
          [req.user.id, beat_id, license_id]
      );

      return res.status(201).json({ message: 'Item added to cart' });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /cart - Fetch all items in the user's cart
app.get('/api/carts', authenticateJWT, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
          carts.id AS cart_id,
          beats.id AS beat_id,
          beats.title AS beat_title,
          beats.bpm,
          beats.musical_key,
          licenses.id AS license_id,
          licenses.name AS license_name
       FROM carts
       JOIN beats ON carts.beat_id = beats.id
       JOIN licenses ON carts.license_id = licenses.id
       WHERE carts.user_id = $1 AND carts.order_id IS NULL`, // Filter active cart items
      [req.user.id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/carts/:cart_id', authenticateJWT, async (req, res) => {
  const { cart_id } = req.params;

  try {
      const result = await pool.query(
          'DELETE FROM carts WHERE id = $1 AND user_id = $2 RETURNING *',
          [cart_id, req.user.id]
      );

      if (result.rowCount === 0) {
          return res.status(404).json({ message: 'Item not found or not authorized' });
      }

      res.status(200).json({ message: 'Item removed from cart' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/discount-codes/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM public.discount_codes WHERE code = $1 AND is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())',
      [code]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Discount code not valid or expired' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching discount code:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/orders', authenticateJWT, async (req, res) => {
  const { discountCode } = req.body;
  const userId = req.user.id;

  try {
    // Fetch active cart items
    const cartResult = await pool.query(
      `SELECT 
          carts.id AS cart_id,
          beats.id AS beat_id,
          beats.title AS beat_title,
          beats.bpm,
          beats.musical_key,
          licenses.id AS license_id,
          licenses.name AS license_name,
          licenses.price AS license_price
       FROM carts
       JOIN beats ON carts.beat_id = beats.id
       JOIN licenses ON carts.license_id = licenses.id
       WHERE carts.user_id = $1 AND carts.order_id IS NULL`, // Only active cart items
      [userId]
    );

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Calculate total price
    let totalPrice = cartResult.rows.reduce((sum, item) => sum + parseFloat(item.license_price), 0);

    // Apply discount if provided
    let discountCodeId = null;
    if (discountCode) {
      const discountResult = await pool.query(
        'SELECT * FROM public.discount_codes WHERE code = $1 AND is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())',
        [discountCode]
      );

      if (discountResult.rows.length > 0) {
        discountCodeId = discountResult.rows[0].id;
        totalPrice *= 1 - discountResult.rows[0].discount_percentage / 100;
      } else {
        return res.status(400).json({ message: 'Invalid or expired discount code' });
      }
    }

    // Create a new order
    const orderResult = await pool.query(
      'INSERT INTO public.orders (user_id, total_price, discount_code_id) VALUES ($1, $2, $3) RETURNING *',
      [userId, totalPrice, discountCodeId]
    );

    const orderId = orderResult.rows[0].id;

    // Update the cart items to associate them with the created order
    await pool.query(
      'UPDATE carts SET order_id = $1 WHERE user_id = $2 AND order_id IS NULL',
      [orderId, userId]
    );

    res.status(201).json({ message: 'Order created successfully', order: orderResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/orders', authenticateJWT, async (req, res) => {
  const userId = req.user.id; // Extract userId from JWT
  try {
    const result = await pool.query(
      'SELECT * FROM public.orders WHERE user_id = $1',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/orders/:id', authenticateJWT, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  try {
    const orderResult = await pool.query(
      'SELECT * FROM public.orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const itemsResult = await pool.query(
      `SELECT 
        carts.id AS cart_id, 
        beats.id AS beat_id,
        beats.title,
        beats.bpm,
        beats.musical_key,
        beats.image_url,
        beats.mp3_url
      FROM carts
      LEFT JOIN beats ON carts.beat_id = beats.id
      WHERE carts.order_id = $1;`,
      [orderId]
    );

    const itemsWithPresignedUrls = itemsResult.rows.map((item) => {
      const imageParams = {
        Bucket: 'beatstore-bucket/images', // Adjust for your S3 structure
        Key: decodeURIComponent(item.image_url.split('/').pop()),
        Expires: 60 * 60, // 1 hour
      };

      const presignedImageUrl = s3.getSignedUrl('getObject', imageParams);

      return {
        ...item,
        image_url: presignedImageUrl, // Replace image URL with presigned URL
      };
    });

    res.status(200).json({
      order: orderResult.rows[0],
      items: itemsWithPresignedUrls,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/orders/:id/payment', authenticateJWT, async (req, res) => {
  const orderId = req.params.id;
  const { paymentStatus } = req.body; // Assuming paymentStatus is passed after PayPal confirmation

  if (paymentStatus !== 'success') {
    return res.status(400).json({ message: 'Payment not successful' });
  }

  try {
    // Mark order as paid
    const result = await pool.query(
      'UPDATE public.orders SET is_paid = TRUE, paid_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
      [orderId, req.user.id] // Make sure the user is only updating their own order
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(result.rows[0]); // Return the updated order
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

const sendFilesToBuyer = (orderId) => {
  // Logic to fetch order details, associated beats, and user info
  // Trigger file sending process (e.g., email with download links)
  console.log(`Sending files for order ID ${orderId}`);
};

app.post('/api/orders/:id/send-files', authenticateJWT, async (req, res) => {
  const orderId = req.params.id;

  try {
    // Ensure the user is the one who made the order
    const result = await pool.query(
      'SELECT * FROM public.orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send files to buyer
    sendFilesToBuyer(orderId);
    res.status(200).json({ message: 'Files sent to buyer' });
  } catch (err) {
    console.error('Error sending files:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// Start the server
const port = process.env.PORT || 5001;
app.listen(port,'0.0.0.0',  () => {
    console.log(`Server is running on port ${port}`);
});