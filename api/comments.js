// api/comments.js - Memory-based storage (no file system)
let commentsStore = { comments: {}, lastUpdated: new Date().toISOString() };

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
            return res.status(200).json(commentsStore);
        }
        
        if (req.method === 'POST') {
            const { comments } = req.body;
            
            if (!comments) {
                return res.status(400).json({ error: 'Comments data is required' });
            }
            
            commentsStore = {
                comments: comments,
                lastUpdated: new Date().toISOString()
            };
            
            return res.status(200).json({ 
                success: true, 
                message: 'Comments saved successfully',
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
