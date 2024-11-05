If you're using Knex.js as your query builder without a data model (like Mongoose or Sequelize), your implementation will involve writing raw SQL queries or Knex queries directly within your services. You would manage the connection pool and query execution using Knex, and each service would interact with the same SQL database.

Here’s how you can structure your application using Knex.js:

### 1. **Folder Structure**

```bash
project-root/
│
├── config/
│   └── knexfile.js           # Knex.js configuration (DB settings)
├── db/
│   └── connection.js         # Exports Knex connection
├── services/
│   └── trackService.js       # Track service using Knex
│   └── userService.js        # User service using Knex
├── controllers/
│   └── trackController.js    # Controller for handling track requests
│   └── userController.js     # Controller for handling user requests
├── migrations/               # Folder for database migrations
├── routes/
│   └── trackRoutes.js        # Track routes
│   └── userRoutes.js         # User routes
├── middlewares/              # Custom middleware like auth, error handlers
├── app.js                    # Express app setup
└── server.js                 # Entry point of the app
```

### 2. **Knex Configuration (`knexfile.js`)**

The `knexfile.js` contains the configuration for your development, testing, and production environments.

```javascript
module.exports = {
  development: {
    client: "mysql", // or 'pg' for PostgreSQL, etc.
    connection: {
      host: "127.0.0.1",
      user: "your-username",
      password: "your-password",
      database: "your-database",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
  production: {
    client: "mysql",
    connection: process.env.DATABASE_URL, // Use environment variables in production
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
```

### 3. **Knex Connection (`db/connection.js`)**

This file creates and exports the Knex connection, which will be used in your services.

```javascript
const knex = require("knex");
const config = require("../config/knexfile");

const environment = process.env.NODE_ENV || "development";
const connection = knex(config[environment]);

module.exports = connection;
```

### 4. **Service Layer (Example for `trackService.js`)**

You’ll use the Knex instance from `db/connection.js` in your services. Here’s an example of how you might implement the `trackService.js`:

```javascript
const knex = require("../db/connection");

exports.getAllTracks = async () => {
  try {
    return await knex("tracks").select("*"); // Fetch all tracks
  } catch (error) {
    throw error;
  }
};

exports.getTrackById = async (id) => {
  try {
    return await knex("tracks").where({ id }).first(); // Fetch track by ID
  } catch (error) {
    throw error;
  }
};

exports.createTrack = async (trackData) => {
  try {
    return await knex("tracks").insert(trackData).returning("*"); // Insert new track
  } catch (error) {
    throw error;
  }
};

exports.updateTrack = async (id, updateData) => {
  try {
    return await knex("tracks").where({ id }).update(updateData).returning("*"); // Update track
  } catch (error) {
    throw error;
  }
};

exports.deleteTrack = async (id) => {
  try {
    return await knex("tracks").where({ id }).del(); // Delete track
  } catch (error) {
    throw error;
  }
};
```

Similarly, you would write the user service (`userService.js`):

### 5. **User Service (`userService.js`)**

```javascript
const knex = require("../db/connection");

exports.getAllUsers = async () => {
  try {
    return await knex("users").select("*"); // Fetch all users
  } catch (error) {
    throw error;
  }
};

exports.getUserById = async (id) => {
  try {
    return await knex("users").where({ id }).first(); // Fetch user by ID
  } catch (error) {
    throw error;
  }
};

exports.createUser = async (userData) => {
  try {
    return await knex("users").insert(userData).returning("*"); // Insert new user
  } catch (error) {
    throw error;
  }
};

exports.updateUser = async (id, updateData) => {
  try {
    return await knex("users").where({ id }).update(updateData).returning("*"); // Update user
  } catch (error) {
    throw error;
  }
};

exports.deleteUser = async (id) => {
  try {
    return await knex("users").where({ id }).del(); // Delete user
  } catch (error) {
    throw error;
  }
};
```

### 6. **Controller Layer (`trackController.js`)**

The controllers will call the service methods and handle request/response logic.

```javascript
const trackService = require("../services/trackService");

exports.getTracks = async (req, res, next) => {
  try {
    const tracks = await trackService.getAllTracks();
    res.status(200).json(tracks);
  } catch (error) {
    next(error);
  }
};

exports.createTrack = async (req, res, next) => {
  try {
    const newTrack = await trackService.createTrack(req.body);
    res.status(201).json(newTrack);
  } catch (error) {
    next(error);
  }
};

// Other controller methods: getTrackById, updateTrack, deleteTrack
```

### 7. **Migrations (for `tracks` and `users` Tables)**

With Knex, you can manage your database schema through migrations. Here’s an example migration for creating the `tracks` and `users` tables.

#### Create migration file:

```bash
npx knex migrate:make create_tracks_table
```

#### Migration file (`migrations/YYYYMMDD_create_tracks_table.js`):

```javascript
exports.up = function (knex) {
  return knex.schema.createTable("tracks", function (table) {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.string("artist").notNullable();
    table.string("album");
    table.integer("duration"); // In seconds
    table.string("genre");
    table.timestamps(true, true); // created_at and updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tracks");
};
```

#### Running Migrations:

```bash
npx knex migrate:latest
```

### 8. **Error Handling and Middleware**

You can create centralized error handling and middleware (e.g., for authentication) as needed, such as `middlewares/errorHandler.js` and `middlewares/authMiddleware.js`.

### 9. **Pros of This Approach**

- **Flexibility**: You can write custom queries as needed without being tied to an ORM's abstraction.
- **Control over Queries**: Knex provides a lot of flexibility for writing complex SQL queries while still being easier to use than raw SQL.
- **Transaction Management**: Knex supports transactions, allowing you to execute multiple queries as an atomic unit.

### 10. **Cons of This Approach**

- **No Models**: Since you’re not using models or schemas, you have to manually ensure the integrity of your queries and data structures.
- **Complexity for Large Applications**: As your app grows, not having the structure and validation that an ORM provides can make things harder to manage.

This approach gives you full control over your database queries while using Knex.js as a powerful query builder.
