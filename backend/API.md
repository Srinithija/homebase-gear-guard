# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently, no authentication is required. All endpoints are publicly accessible.

## Response Format
All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {/* Response data */}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [/* Optional validation errors */]
}
```

## Appliances API

### Get All Appliances
**GET** `/api/appliances`

Query Parameters:
- `search` (optional): Search in name, brand, model, or serial number
- `status` (optional): Filter by warranty status (`all`, `active`, `expired`, `expiring-soon`)

Example:
```bash
curl "http://localhost:3001/api/appliances?search=samsung&status=active"
```

### Get Appliance by ID
**GET** `/api/appliances/:id`

Example:
```bash
curl http://localhost:3001/api/appliances/123e4567-e89b-12d3-a456-426614174000
```

### Get Appliance Statistics
**GET** `/api/appliances/stats`

Returns appliance counts by warranty status.

### Create Appliance
**POST** `/api/appliances`

Request Body:
```json
{
  "name": "Samsung Refrigerator",
  "brand": "Samsung",
  "model": "RF28R7351SG",
  "serialNumber": "ABC123456",
  "purchaseDate": "2024-01-15",
  "warrantyPeriodMonths": 24,
  "warrantyExpiry": "2026-01-15",
  "purchaseLocation": "Best Buy",
  "manualLink": "https://example.com/manual.pdf",
  "receiptLink": "https://example.com/receipt.pdf"
}
```

Example:
```bash
curl -X POST http://localhost:3001/api/appliances \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung Refrigerator",
    "brand": "Samsung",
    "model": "RF28R7351SG",
    "purchaseDate": "2024-01-15",
    "warrantyPeriodMonths": 24,
    "warrantyExpiry": "2026-01-15"
  }'
```

### Update Appliance
**PUT** `/api/appliances/:id`

Request Body: Same as create, but all fields are optional.

### Delete Appliance
**DELETE** `/api/appliances/:id`

Example:
```bash
curl -X DELETE http://localhost:3001/api/appliances/123e4567-e89b-12d3-a456-426614174000
```

## Maintenance Tasks API

### Get All Maintenance Tasks
**GET** `/api/maintenance`

Query Parameters:
- `applianceId` (optional): Filter by appliance ID

### Get Upcoming Maintenance
**GET** `/api/maintenance/upcoming`

Query Parameters:
- `days` (optional): Number of days ahead to look (default: 14)

### Get Maintenance Task by ID
**GET** `/api/maintenance/:id`

### Create Maintenance Task
**POST** `/api/maintenance`

Request Body:
```json
{
  "applianceId": "123e4567-e89b-12d3-a456-426614174000",
  "taskName": "Filter Replacement",
  "date": "2024-03-15",
  "frequency": "quarterly",
  "serviceProviderName": "HVAC Services Inc",
  "serviceProviderContact": "+1-555-123-4567",
  "reminderDate": "2024-03-10",
  "completed": false
}
```

Frequency options: `one-time`, `yearly`, `bi-yearly`, `quarterly`, `monthly`

### Update Maintenance Task
**PUT** `/api/maintenance/:id`

### Delete Maintenance Task
**DELETE** `/api/maintenance/:id`

## Contacts API

### Get All Contacts
**GET** `/api/contacts`

Query Parameters:
- `applianceId` (optional): Filter by appliance ID

### Get Contact by ID
**GET** `/api/contacts/:id`

### Create Contact
**POST** `/api/contacts`

Request Body:
```json
{
  "applianceId": "123e4567-e89b-12d3-a456-426614174000",
  "contactName": "Samsung Customer Service",
  "phone": "+1-800-SAMSUNG",
  "email": "support@samsung.com",
  "notes": "24/7 customer support"
}
```

### Update Contact
**PUT** `/api/contacts/:id`

### Delete Contact
**DELETE** `/api/contacts/:id`

## Data Validation

All endpoints validate input data using Zod schemas:

### Common Validation Rules
- UUIDs must be valid UUID format
- Dates must be in YYYY-MM-DD format
- Email addresses must be valid email format
- Phone numbers are limited to 50 characters
- Text fields have appropriate length limits

### Error Responses
Validation errors return status 400 with detailed error information:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "purchaseDate",
      "message": "Invalid date format"
    }
  ]
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## Testing with cURL

### Health Check
```bash
curl http://localhost:3001/health
```

### Create Appliance
```bash
curl -X POST http://localhost:3001/api/appliances \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LG Washing Machine",
    "brand": "LG",
    "model": "WM3600HWA",
    "purchaseDate": "2024-01-01",
    "warrantyPeriodMonths": 12,
    "warrantyExpiry": "2025-01-01"
  }'
```

### Get All Appliances
```bash
curl http://localhost:3001/api/appliances
```

### Create Maintenance Task
```bash
curl -X POST http://localhost:3001/api/maintenance \
  -H "Content-Type: application/json" \
  -d '{
    "applianceId": "YOUR_APPLIANCE_ID",
    "taskName": "Annual Cleaning",
    "date": "2024-12-01",
    "frequency": "yearly",
    "serviceProviderName": "Local Repair Shop",
    "serviceProviderContact": "555-0123",
    "reminderDate": "2024-11-25",
    "completed": false
  }'
```