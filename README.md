## 🐳 Run with Docker Compose (Recommended)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Start the application

1. Clone the repository:

   ```bash
   git clone https://github.com/Mayankpillai/personal-expense-tracker.git
   cd personal-expense-tracker
   ```

2. Build and start the application and MongoDB:

   ```bash
   docker compose up --build -d
   ```

3. Open the application:

   **http://localhost:3003**

4. Check container status:

   ```bash
   docker compose ps
   ```

5. View application logs:

   ```bash
   docker compose logs app
   ```

### Stop the application

```bash
docker compose down
```

MongoDB data is stored in a Docker named volume and is retained when containers are stopped or removed with `docker compose down`. To delete the database volume as well, run `docker compose down -v` — this permanently removes the stored database data.

### Access the API

Use Postman or another HTTP client:

- `GET http://localhost:3003/api/transactions`
- `POST http://localhost:3003/api/transactions`

For POST requests, select **Body → raw → JSON** and supply a transaction object matching the application's API schema.
