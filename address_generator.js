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

let availableKeys = [...KEYS];
const bannedKeys = new Map();
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
    const now = Date.now();
    for (const [key, expireTime] of bannedKeys.entries()) {
        if (now > expireTime) {
            bannedKeys.delete(key);
            if (!availableKeys.includes(key)) {
                availableKeys.push(key);
            }
        }
    }
    
    if (availableKeys.length === 0) {
        return null;
    }
    
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
            
            console.log(`Response from Find API:`, JSON.stringify(data));
            
            if (data.Items && data.Items[0] && data.Items[0].Error) {
                const errorCode = data.Items[0].Error;
                console.error(`Error in API response: ${errorCode}`);
                
                if (errorCode === "17") {
                    console.log(`Key ${currentKey} has reached rate limit, banning for 24 hours`);
                    const banExpireTime = Date.now() + (24 * 60 * 60 * 1000);
                    bannedKeys.set(currentKey, banExpireTime);
                }
                
                if (errorCode === "2" || errorCode === "5") {
                    console.error(`Removing invalid key (Error ${errorCode}): ${currentKey}`);
                    availableKeys = availableKeys.filter(k => k !== currentKey);
                    currentKeyIndex = currentKeyIndex % Math.max(1, availableKeys.length);
                }
                
                i--;
                continue;
            }
            
            const addrItem = data.Items.find(item => item.Type === 'Address');
            if (!addrItem) continue;

            const url2 = `https://api.addressy.com/Capture/Interactive/Retrieve/v1/json3.ws?Key=${currentKey}&Id=${addrItem.Id}`;
            const res2 = await got(url2, { responseType: 'json', https: { rejectUnauthorized: false } });
            const data2 = res2.body;
            
            console.log(`Response from Retrieve API:`, JSON.stringify(data2));
            
            if (data2.Items && data2.Items[0] && data2.Items[0].Error) {
                const errorCode = data2.Items[0].Error;
                console.error(`Error in Retrieve API: ${errorCode}`);
                
                if (errorCode === "2" || errorCode === "5") {
                    console.error(`Removing invalid key (Error ${errorCode}): ${currentKey}`);
                    availableKeys = availableKeys.filter(k => k !== currentKey);
                    currentKeyIndex = currentKeyIndex % Math.max(1, availableKeys.length);
                }
                
                i--;
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
            
            if (err.response && (err.response.statusCode === 401 || 
                err.response.statusCode === 403 || 
                err.message.includes('invalid key'))) {
                console.error(`Removing invalid key: ${currentKey}`);
                availableKeys = availableKeys.filter(k => k !== currentKey);
                currentKeyIndex = currentKeyIndex % Math.max(1, availableKeys.length);
            }
            
            i--;
        }
    }

    return null;
}