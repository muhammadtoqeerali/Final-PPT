// api/comments.js - Using Vercel KV Database
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Get comments from KV database
            const data = await kv.get('presentation-comments') || { 
                comments: {}, 
                lastUpdated: new Date().toISOString() 
            };
            return res.status(200).json(data);
        }
        
        if (req.method === 'POST') {
            const { comments } = req.body;
            
            if (!comments) {
                return res.status(400).json({ error: 'Comments data is required' });
            }
            
            const data = {
                comments: comments,
                lastUpdated: new Date().toISOString()
            };
            
            // Save permanently to KV database
            await kv.set('presentation-comments', data);
            
            return res.status(200).json({ 
                success: true, 
                message: 'Comments saved permanently to database',
                totalComments: Object.keys(comments).length
            });
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
}
