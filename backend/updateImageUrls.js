import { db } from './config/db.js';

async function updateImageUrls() {
    try {
        console.log('Updating product image URLs...');

        // Update products table - remove ${import.meta.env.VITE_API_URL} prefix
        await db.query(`
            UPDATE products
            SET image_url = REPLACE(image_url, '\${import.meta.env.VITE_API_URL}', '')
            WHERE image_url LIKE '\${import.meta.env.VITE_API_URL}/%'
        `);

        // Update categories table - remove ${import.meta.env.VITE_API_URL} prefix
        await db.query(`
            UPDATE categories
            SET image_url = REPLACE(image_url, '\${import.meta.env.VITE_API_URL}', '')
            WHERE image_url LIKE '\${import.meta.env.VITE_API_URL}/%'
        `);

        // Also handle any localhost URLs that might exist
        await db.query(`
            UPDATE products
            SET image_url = REPLACE(image_url, 'http://localhost:3000', '')
            WHERE image_url LIKE 'http://localhost:3000/%'
        `);

        await db.query(`
            UPDATE categories
            SET image_url = REPLACE(image_url, 'http://localhost:3000', '')
            WHERE image_url LIKE 'http://localhost:3000/%'
        `);

        console.log('Image URLs updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating image URLs:', error);
        process.exit(1);
    }
}

updateImageUrls();
