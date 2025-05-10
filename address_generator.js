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
let keyIdx = 0;
const keyExceeded = new Array(KEYS.length).fill(false);

function genStr() {
    const num = Math.floor(Math.random() * (9999 - 100 + 1)) + 100;
    const char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `${num}+${char}`;
}

function isValid(item) {
    return item && item.Street && item.City && item.ProvinceName && item.PostalCode;
}

export async function genAddr() {
    const maxTries = KEYS.length * 2;

    for (let i = 0; i < maxTries; i++) {
        const str = genStr();

        const url = `https://api.addressy.com/Capture/Interactive/Find/v1.1/json3.ws?Key=${KEYS[keyIdx]}&Text=${str}&Countries=US&Language=en-gb`;

        try {
            const res = await got(url, { responseType: 'json', https: { rejectUnauthorized: false } });
            const data = res.body;

            if (data.Items[0]?.Error === "17") {
                keyExceeded[keyIdx] = true;
                keyIdx = (keyIdx + 1) % KEYS.length;
                if (keyExceeded.every(exceeded => exceeded)) {
                    console.error("All keys have exceeded their limits.");
                    return null;
                }
                continue;
            }

            const addrItem = data.Items.find(item => item.Type === 'Address');
            if (!addrItem) continue;

            const url2 = `https://api.addressy.com/Capture/Interactive/Retrieve/v1/json3.ws?Key=${KEYS[keyIdx]}&Id=${addrItem.Id}`;
            const res2 = await got(url2, { responseType: 'json', https: { rejectUnauthorized: false } });
            const data2 = res2.body;
            const item = data2.Items[0];

            if (isValid(item)) {
                return {
                    street: item.Street,
                    full_addr: `${item.BuildingNumber} ${item.Street}`,
                    city: item.City,
                    state: item.ProvinceName,
                    state_short: item.Province,
                    zip: item.PostalCode.split('-')[0]
                };
            }
        } catch (err) {
            console.error(`Error during try ${i}:`, err.message);
            i--; // Decrement the counter to retry the current attempt
        }
    }

    return null;
}