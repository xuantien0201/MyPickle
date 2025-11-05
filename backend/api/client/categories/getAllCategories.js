import express from 'express';
import { db } from '../../../config/db.js'; // Adjusted path

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY name');

        // Construct full image URLs dynamically
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const categoriesWithFullUrls = categories.map(category => {
            let imageUrl = category.image_url;
            if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                imageUrl = `${baseUrl}${imageUrl}`;
            }
            return {
                ...category,
                image_url: imageUrl
            };
        });

        res.json(categoriesWithFullUrls);
    } catch (error) {
        console.error('Lỗi khi lấy tất cả danh mục:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export default router;
