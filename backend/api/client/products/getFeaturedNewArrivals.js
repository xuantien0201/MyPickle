import express from 'express';
import { db } from '../../../config/db.js'; // Adjusted path

const router = express.Router();

// Get new arrivals
router.get('/featured/new-arrivals', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE is_new = true ORDER BY created_at DESC LIMIT 8');

        // Construct full image URLs dynamically
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const productsWithFullUrls = products.map(product => {
            let imageUrl = product.image_url;
            if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                imageUrl = `${baseUrl}${imageUrl}`;
            }
            return {
                ...product,
                image_url: imageUrl
            };
        });

        res.json(productsWithFullUrls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch new arrivals' });
    }
});

export default router;
