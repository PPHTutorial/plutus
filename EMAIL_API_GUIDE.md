# Email API Usage Guide

This project includes a ready-to-use API endpoint for sending emails using the SMTP configuration defined in your `.env` file.

## 1. Configuration
Ensure your `.env` file has the following variables set (already configured):


## 2. API Endpoint
**URL:** `/api/send-email`
**Method:** `POST`
**Content-Type:** `application/json`

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `to` | string | Yes | Recipient email address |
| `subject` | string | Yes | Email subject line |
| `text` | string | No* | Plain text version of the email |
| `html` | string | No* | HTML version of the email |

*\*At least one of `text` or `html` must be provided.*

### Example Usage (Frontend / React)

```typescript
const sendEmail = async () => {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: 'client@example.com',
      subject: 'Welcome!',
      text: 'Hello from Plutus',
      html: '<h1>Hello from Plutus</h1>'
    })
  });

  const data = await response.json();
  console.log(data);
};
```

### Example Usage (cURL)

```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test email from the API"
  }'
```

## 3. Testing
Access the visual test interface at:
`http://localhost:3000/test-email`
