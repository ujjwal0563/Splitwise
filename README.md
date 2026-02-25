# Splitwise Backend

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```
cp .env.example .env
```

| Variable    | Description                   | Example                          |
|-------------|-------------------------------|----------------------------------|
| MONGO_URI   | MongoDB connection string     | mongodb+srv://user:pass@cluster  |
| MONGO_DB    | Database name                 | splitwise                        |
| JWT_SECRET  | Secret key for JWT tokens     | your-secret-key-here             |
| PORT        | Server port (default: 8080)   | 8080                             |

## Run Locally

```bash
cd backend
go run main.go
```



## API Endpoints

### Public
| Method | Endpoint               | Description        |
|--------|------------------------|--------------------|
| POST   | /api/users/register    | Register a user    |
| POST   | /api/users/login       | Login & get JWT    |
| GET    | /health                | Health check       |

### Protected (Bearer Token Required)
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| GET    | /api/users/profile                | Get your profile         |
| PUT    | /api/users/profile                | Update your profile      |
| GET    | /api/users/settlements            | Your settlements         |
| GET    | /api/users/balances               | Your overall balance     |
| POST   | /api/groups                       | Create a group           |
| GET    | /api/groups/{id}                  | Get group details        |
| DELETE | /api/groups/{id}                  | Delete a group           |
| POST   | /api/groups/{id}/members          | Add member to group      |
| DELETE | /api/groups/{id}/members/{uid}    | Remove member            |
| POST   | /api/groups/{id}/expenses         | Add an expense           |
| GET    | /api/groups/{id}/expenses         | List group expenses      |
| DELETE | /api/expenses/{id}                | Delete an expense        |
| GET    | /api/groups/{id}/balances         | Get group balances       |
| POST   | /api/groups/{id}/settle           | Record a settlement      |
| GET    | /api/groups/{id}/settlements      | List group settlements   |
| DELETE | /api/settlements/{id}             | Delete a settlement      |
