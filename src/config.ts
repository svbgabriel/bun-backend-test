export default {
  port: process.env.PORT || 3000,
  databaseUri: process.env.DB_URL || "mongodb://localhost:27017",
  secret: process.env.SECRET || "ssssshhh",
  ttl: Number(process.env.TTL || 10000),
};
