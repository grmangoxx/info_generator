import { generateUser } from './user_generator.js';
import { genAddr } from './address_generator.js';
import http from 'http';
import url from 'url';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;
    
    if (path === '/' && req.method === 'GET') {
        try {
            // Get country from query parameter, default to US if not provided
            const country = (query.country || 'US').toUpperCase();
            
            // Validate country is either US, GB, CA, or AU
            const validCountries = ['US', 'GB', 'CA', 'AU'];
            if (!validCountries.includes(country)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid country parameter. Use US, GB, CA, or AU.' }));
                return;
            }
            
            const [user, address] = await Promise.all([
                generateUser(),
                genAddr(country)
            ]);

            const combinedData = { ...user, ...address };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(combinedData));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'An error occurred while generating data.' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});