import { generateUser } from '../user_generator.js';
import { genAddr } from '../address_generator.js';
import http from 'http';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        try {
            const [user, address] = await Promise.all([
                generateUser(),
                genAddr()
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