import UserAgent from 'user-agents';
import { faker } from '@faker-js/faker';
import libphonenumber from 'google-libphonenumber'; 

const { PhoneNumberUtil, PhoneNumberFormat } = libphonenumber; 

function generateUser() {
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    const first_name = faker.person.firstName({ allowSpecialCharacters: false }).toLowerCase();
    const last_name = faker.person.lastName({ allowSpecialCharacters: false }).toLowerCase();

    const phoneUtil = PhoneNumberUtil.getInstance();
    let validPhoneNumber = null;

    while (!validPhoneNumber) {
        try {
            const rawPhoneNumber = faker.phone.number('##########');
            const phoneNumber = phoneUtil.parseAndKeepRawInput(rawPhoneNumber, 'US');
            if (phoneUtil.isValidNumber(phoneNumber)) {
                validPhoneNumber = phoneUtil.format(phoneNumber, PhoneNumberFormat.E164).replace('+1', ''); 
            }
        } catch (error) {
            console.error('Invalid phone number generated, retrying...');
        }
    }

    return {
        user_agent: userAgent.toString(),
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
        u1: faker.string.uuid(),
        u2: faker.string.uuid(),
        u3: faker.string.uuid(),
    };
}

export { generateUser };