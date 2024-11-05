const secrets = {
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING as string,
  API_JWT_SECRET: process.env.API_JWT_SECRET as string,
};

export default secrets;
