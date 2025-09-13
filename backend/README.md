# Home Appliance Tracker - Backend API

A RESTful API backend for managing home appliances, maintenance schedules, and warranty information built with Express.js, PostgreSQL, and Drizzle ORM.

## 🚀 Features

- **Appliance Management**: CRUD operations for home appliances
- **Maintenance Tracking**: Schedule and track maintenance tasks
- **Contact Management**: Store service provider and warranty contacts
- **Warranty Monitoring**: Track warranty status and expiration dates
- **Search & Filtering**: Advanced search and filtering capabilities
- **Data Validation**: Comprehensive input validation with Zod
- **Database Relations**: Proper foreign key relationships with cascade deletes
- **Error Handling**: Structured error responses and logging
- **TypeScript**: Full TypeScript support for type safety

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Language**: TypeScript
- **Development**: Nodemon for hot reload

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # Database connection and configuration
│   │   └── env.ts           # Environment variable validation
│   ├── controllers/
│   │   ├── applianceController.ts
│   │   ├── contactController.ts
│   │   └── maintenanceController.ts
│   ├── db/
│   │   └── schema.ts        # Database schema definitions
│   ├── middleware/
│   │   ├── errorHandler.ts  # Global error handling
│   │   └── validation.ts    # Request validation middleware
│   ├── routes/
│   │   ├── appliances.ts    # Appliance routes
│   │   ├── contacts.ts      # Contact routes
│   │   ├── maintenance.ts   # Maintenance routes
│   │   └── index.ts         # Route aggregation
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/
│   │   └── responses.ts     # Response helper functions
│   └── server.ts            # Main server entry point
├── drizzle.config.ts        # Drizzle ORM configuration
├── package.json
├── tsconfig.json
├── SETUP.md                 # Detailed setup instructions
├── API.md                   # API documentation
└── test-api.js              # API testing script
```

## 🚦 Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd homebase-gear-guard/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up PostgreSQL database**:
   ```sql
   CREATE DATABASE homebase_gear_guard;
   CREATE USER homebase_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE homebase_gear_guard TO homebase_user;
   ```

5. **Run database migrations**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

The server will be available at `http://localhost:3001`

## 📚 API Documentation

See [API.md](./API.md) for complete API documentation including:
- All available endpoints
- Request/response formats
- Example cURL commands
- Error handling

## 🧪 Testing

### Automated Testing
Run the included API test script:
```bash
node test-api.js
```

This script tests all endpoints and validates:
- CRUD operations for all entities
- Data validation
- Error handling
- Relationship constraints

### Manual Testing
Test the health endpoint:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-09-13T...",
  "environment": "development"
}
```

## 📊 Database Schema

### Appliances
- Basic appliance information (name, brand, model, serial number)
- Purchase details (date, location, warranty period)
- Documentation links (manual, receipt)
- Audit fields (created/updated timestamps)

### Maintenance Tasks
- Task details (name, date, frequency)
- Service provider information
- Completion status and reminders
- Linked to appliances with cascade delete

### Contacts
- Contact information (name, phone, email)
- Notes and additional details
- Linked to appliances with cascade delete

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply database migrations
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🛡 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Input Validation**: Comprehensive validation with Zod
- **SQL Injection Protection**: Drizzle ORM with parameterized queries
- **Error Sanitization**: Sensitive information filtering

## 🔄 Data Relationships

- **Appliances** → **Maintenance Tasks** (One-to-Many)
- **Appliances** → **Contacts** (One-to-Many)
- Cascade deletes ensure data integrity

## 📈 Monitoring & Logging

- Request logging with Morgan
- Structured error logging
- Health check endpoint for monitoring
- Database connection status

## 🚀 Deployment

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

### Production Build
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write clear commit messages
5. Test your changes with the test script

## 📝 License

[Add your license information here]

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in .env
   - Kill process using the port

3. **TypeScript Compilation Errors**
   - Check all imports are correct
   - Ensure all types are properly defined
   - Run `npm run build` to see detailed errors

### Getting Help

1. Check the [API documentation](./API.md)
2. Review the [setup guide](./SETUP.md)
3. Run the test script to identify issues
4. Check server logs for error details

## 🔗 Related

- [Frontend Repository](../README.md)
- [Database Schema Documentation](./API.md#database-schema)
- [Deployment Guide](./SETUP.md#deployment)