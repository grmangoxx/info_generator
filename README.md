# User & Address Generator

A Node.js utility for generating realistic fake user profiles and addresses using various APIs and libraries.

## Features

- **User Generation**: Creates realistic user profiles with valid personal information
- **Address Generation**: Generates real addresses using Addressy API
- **Multiple Country Support**: Supports US, GB, CA, AU and more
- **Phone Number Validation**: Uses Google's libphonenumber for accurate phone numbers
- **API Key Management**: Automatic rotation and error handling for API keys

## Installation

```bash
npm install
```

## Dependencies

```bash
npm install got @faker-js/faker user-agents google-libphonenumber
```

## Usage

### Generate User Profile

```javascript
import { generateUser } from './user_generator.js';

// Generate US user (default)
const user = generateUser();

// Generate user from specific country
const ukUser = generateUser('GB');
const canadianUser = generateUser('CA');
const australianUser = generateUser('AU');

console.log(user);
// Output:
// {
//   user_agent: "Mozilla/5.0...",
//   sex: "male",
//   first_name: "john",
//   last_name: "doe",
//   mail: "john.doe@gmail.com",
//   user_name: "johndoe123",
//   password: "a1b2c3d4e5",
//   phone: "1234567890",
//   country_code: "1",
//   timezone: "America/New_York",
//   u1: "uuid-1",
//   u2: "uuid-2",
//   u3: "uuid-3"
// }
```

### Generate Address

```javascript
import { genAddr } from './address_generator.js';

// Generate US address (default)
const address = await genAddr();

// Generate address from specific country
const ukAddress = await genAddr('GB');

console.log(address);
// Output:
// {
//   key: "HB47-HM98-UH39-CR94",
//   street: "Main St",
//   full_addr: "123 Main St",
//   city: "New York",
//   state: "New York",
//   state_short: "NY",
//   zip: "10001"
// }
```

## Supported Countries

| Code | Country | User Gen | Address Gen |
|------|---------|----------|-------------|
| US   | United States | ✅ | ✅ |
| GB   | United Kingdom | ✅ | ✅ |
| CA   | Canada | ✅ | ✅ |
| AU   | Australia | ✅ | ✅ |

## API Configuration

The address generator uses multiple Addressy API keys for redundancy and rate limit management. Keys are automatically rotated and temporarily banned when rate limits are reached.

## Error Handling

- **Invalid API Keys**: Automatically removed from rotation
- **Rate Limits**: Keys are temporarily banned for 24 hours
- **Network Errors**: Automatic retry with different keys
- **Invalid Phone Numbers**: Regenerated until valid

## Output Examples

### User Profile
```json
{
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "sex": "female",
  "first_name": "sarah",
  "last_name": "johnson",
  "mail": "sarah.johnson@gmail.com",
  "user_name": "sarahjohnson",
  "password": "x9y8z7w6v5",
  "phone": "5551234567",
  "country_code": "1",
  "timezone": "America/Los_Angeles",
  "u1": "123e4567-e89b-12d3-a456-426614174000",
  "u2": "123e4567-e89b-12d3-a456-426614174001",
  "u3": "123e4567-e89b-12d3-a456-426614174002"
}
```

### Address
```json
{
  "key": "PN41-KC26-PF73-TU79",
  "street": "Oak Avenue",
  "full_addr": "456 Oak Avenue",
  "city": "Chicago",
  "state": "Illinois",
  "state_short": "IL",
  "zip": "60601"
}
```

## Notes

- All generated data is fake and for testing purposes only
- Phone numbers are validated using Google's libphonenumber library
- Email addresses use gmail.com provider
- Passwords contain alphanumeric characters and @ symbol
- Timezones are randomly selected based on country

## License

This project is for educational and testing purposes only.
