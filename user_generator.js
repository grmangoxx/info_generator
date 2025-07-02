import UserAgent from 'user-agents';
import { faker } from '@faker-js/faker';
import libphonenumber from 'google-libphonenumber'; 

const { PhoneNumberUtil, PhoneNumberFormat } = libphonenumber; 

function generateUser(country = 'US') {
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    const sex = faker.person.sex();
    const first_name = faker.person.firstName({ sex: sex, allowSpecialCharacters: false }).toLowerCase();
    const last_name = faker.person.lastName({ sex: sex, allowSpecialCharacters: false }).toLowerCase();

    // Set country-specific phone number format and timezones
    const phoneFormats = {
        'US': { 
            format: '##########', 
            countryCode: '+1',
            timezones: [
                'America/New_York',      // Eastern Time
                'America/Chicago',       // Central Time
                'America/Denver',        // Mountain Time
                'America/Los_Angeles',   // Pacific Time
                'America/Phoenix',       // Arizona Time
                'America/Anchorage',     // Alaska Time
                'Pacific/Honolulu'       // Hawaii Time
            ]
        },
        'GB': { 
            format: '#########', 
            countryCode: '+44',
            timezones: ['Europe/London']
        },
        'CA': { 
            format: '##########', 
            countryCode: '+1',
            timezones: [
                'America/Toronto',       // Eastern Time
                'America/Winnipeg',      // Central Time
                'America/Edmonton',      // Mountain Time
                'America/Vancouver'      // Pacific Time
            ]
        },
        'AU': { 
            format: '#########', 
            countryCode: '+61',
            timezones: [
                'Australia/Sydney',      // Eastern Time
                'Australia/Melbourne',   // Eastern Time
                'Australia/Brisbane',    // Eastern Time
                'Australia/Adelaide',    // Central Time
                'Australia/Perth'        // Western Time
            ]
        }
    };

    // Use country-specific format or default to US
    const phoneFormat = phoneFormats[country] || phoneFormats['US'];

    // Select random timezone for the country
    const timezone = faker.helpers.arrayElement(phoneFormat.timezones);

    const phoneUtil = PhoneNumberUtil.getInstance();
    let validPhoneNumber = null;
    let rawNumber = null;

    while (!validPhoneNumber) {
        try {
            rawNumber = faker.phone.number(phoneFormat.format);
            const phoneNumber = phoneUtil.parseAndKeepRawInput(rawNumber, country);
            
            if (phoneUtil.isValidNumber(phoneNumber)) {
                // Format phone number according to country's standard
                validPhoneNumber = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
                // Remove country code for consistency with current implementation
                validPhoneNumber = validPhoneNumber.replace(phoneFormat.countryCode, '');
            }
        } catch (error) {
            console.error(`Invalid ${country} phone number generated, retrying...`);
        }
    }

    return {
        user_agent: userAgent.toString(),
        sex,
        first_name,
        last_name,
        mail: faker.internet.email({
            firstName: first_name,
            lastName: last_name,
            provider: 'gmail.com',
            allowSpecialCharacters: false,
        }).toLowerCase(),
        user_name: faker.internet.username({
            firstName: first_name,
            lastName: last_name,
        }).toLowerCase(),
        password: faker.internet.password({
            length: 10,
            pattern: /[a-zA-Z0-9@]/,
        }),
        phone: validPhoneNumber,
        country_code: phoneFormat.countryCode.replace('+', ''),
        timezone: timezone,
        u1: faker.string.uuid(),
        u2: faker.string.uuid(),
        u3: faker.string.uuid(),
    };
}

export { generateUser };