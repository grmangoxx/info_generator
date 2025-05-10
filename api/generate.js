import { generateUser } from '../user_generator.js';
import { genAddr } from '../address_generator.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const [user, address] = await Promise.all([
                generateUser(),
                genAddr()
            ]);

            // Combine user and address into a single object
            const combinedData = { ...user, ...address };

            // Return the combined data as JSON
            res.status(200).json(combinedData);
        } catch (error) {
            // Handle errors gracefully
            res.status(500).json({ error: 'An error occurred while generating data.' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }
}