// api/comments.js - Using MongoDB
import { MongoClient } from 'mongodb';

// MongoDB connection
const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const client = await clientPromise;
        const db = client.db('presentation');
        const collection = db.collection('comments');

        if (req.method === 'GET') {
            // Get comments from MongoDB
            const result = await collection.findOne({ _id: 'presentation-comments' });
            
            const data = result || { 
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
                _id: 'presentation-comments',
                comments: comments,
                lastUpdated: new Date().toISOString()
            };
            
            // Save to MongoDB (upsert - update if exists, insert if not)
            await collection.replaceOne(
                { _id: 'presentation-comments' },
                data,
                { upsert: true }
            );
            
            return res.status(200).json({ 
                success: true, 
                message: 'Comments saved permanently to MongoDB',
                totalComments: Object.keys(comments).length
            });
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('MongoDB Error:', error);
        return res.status(500).json({ 
            error: 'Database connection failed', 
            details: error.message 
        });
    }
}
