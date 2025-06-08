import got from 'got';

const KEYS = [
    'HB47-HM98-UH39-CR94',
    'PN41-KC26-PF73-TU79',
    'AD38-JK79-NG73-PX92',
    'CB69-MB91-EY32-AC26',
    'TY76-YD25-DR51-ZY92',
    'FG91-DC17-KE99-YZ91',
    'KJ48-ND97-HZ76-DN77',
    'RM85-RG17-GB92-FU37',
    'NH23-BT77-YY58-PT86'
];

// Key management
let availableKeys = [...KEYS];
const bannedKeys = new Map(); // Key -> timestamp when ban expires
let currentKeyIndex = 0;

function genStr() {
    const num = Math.floor(Math.random() * (9999 - 100 + 1)) + 100;
    const char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `${num}+${char}`;
}

function isValid(item) {
    return item && item.Street && item.City && item.ProvinceName && item.PostalCode;
}

function getNextValidKey() {
    // Clean up expired bans
    const now = Date.now();
    for (const [key, expireTime] of bannedKeys.entries()) {
        if (now > expireTime) {
            bannedKeys.delete(key);
            if (!availableKeys.includes(key)) {
                availableKeys.push(key);
            }
        }
    }
    
    // No keys available
    if (availableKeys.length === 0) {
        return null;
    }
    
    // Get next key
    currentKeyIndex = (currentKeyIndex >= availableKeys.length) ? 0 : currentKeyIndex;
    return availableKeys[currentKeyIndex++];
}

export async function genAddr(country = 'US') {
    const maxTries = KEYS.length * 2;

    for (let i = 0; i < maxTries; i++) {
        const currentKey = getNextValidKey();
        
        if (!currentKey) {
            console.error("No valid API keys available.");
            return null;
        }

        const str = genStr();
        const url = `https://api.addressy.com/Capture/Interactive/Find/v1.1/json3.ws?Key=${currentKey}&Text=${str}&Countries=${country}&Language=en-gb`;

        try {
            const res = await got(url, { responseType: 'json', https: { rejectUnauthorized: false } });
            const data = res.body;
            
            // Log the source response for debugging
            console.log(`Response from Find API:`, JSON.stringify(data));
            
            // Check for errors in the response
            if (data.Items && data.Items[0] && data.Items[0].Error) {
                const errorCode = data.Items[0].Error;
                console.error(`Error in API response: ${errorCode}`);
                
                // Rate limit error - ban key for 24 hours
                if (errorCode === "17") {
                    console.log(`Key ${currentKey} has reached rate limit, banning for 24 hours`);
                    const banExpireTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
                    bannedKeys.set(currentKey, banExpireTime);
                }
                
                // Handle unknown key error or URL restriction error - remove key permanently
                if (errorCode === "2" || errorCode === "5") {
                    console.error(`Removing invalid key (Error ${errorCode}): ${currentKey}`);
                    availableKeys = availableKeys.filter(k => k !== currentKey);
                    currentKeyIndex = currentKeyIndex % Math.max(1, availableKeys.length);
                }
                
                // For any error, change key immediately and retry
                i--; // Don't count this as a try
                continue;
            }
            
            // Check if we got valid address items
            const addrItem = data.Items.find(item => item.Type === 'Address');
            if (!addrItem) continue;

            const url2 = `https://api.addressy.com/Capture/Interactive/Retrieve/v1/json3.ws?Key=${currentKey}&Id=${addrItem.Id}`;
            const res2 = await got(url2, { responseType: 'json', https: { rejectUnauthorized: false } });
            const data2 = res2.body;
            
            // Log the source response for debugging
            console.log(`Response from Retrieve API:`, JSON.stringify(data2));
            
            // Check for errors in the second response
            if (data2.Items && data2.Items[0] && data2.Items[0].Error) {
                const errorCode = data2.Items[0].Error;
                console.error(`Error in Retrieve API: ${errorCode}`);
                
                // Handle permanent errors like unknown key or URL restriction
                if (errorCode === "2" || errorCode === "5") {
                    console.error(`Removing invalid key (Error ${errorCode}): ${currentKey}`);
                    availableKeys = availableKeys.filter(k => k !== currentKey);
                    currentKeyIndex = currentKeyIndex % Math.max(1, availableKeys.length);
                }
                
                i--; // Don't count this as a try
                continue;
            }
            
            const item = data2.Items[0];
            if (isValid(item)) {
                const addressResult = {
                    key: currentKey,
                    street: item.Street,
                    full_addr: `${item.BuildingNumber} ${item.Street}`,
                    city: item.City,
                    state: item.ProvinceName,
                    state_short: item.Province,
                    zip: item.PostalCode.split('-')[0]
                };
                
                // Log which key successfully generated the address
                console.log(`Successfully generated address with key ${currentKey}:`, 
                    JSON.stringify({
                        street: addressResult.full_addr,
                        city: addressResult.city,
                        state: addressResult.state,
                        zip: addressResult.zip
                    })
                );
                
                return addressResult;
            }
        } catch (err) {
            console.error(`Error with key ${currentKey}:`, err.message);
            
            // Handle invalid/unknown key errors
            if (err.response && (err.response.statusCode === 401 || 
                err.response.statusCode === 403 || 
                err.message.includes('invalid key'))) {
                console.error(`Removing invalid key: ${currentKey}`);
                availableKeys = availableKeys.filter(k => k !== currentKey);
                currentKeyIndex = currentKeyIndex % Math.max(1, availableKeys.length);
            }
            
            i--; // Don't count this as a try
        }
    }

    return null;
}