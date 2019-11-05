const envVariables = {
  // DB configurations
  DB_USER: process.env.DB_USER || "zwathagehqflzb",
  DB_PASSWORD:process.env.DB_PASSWORD || "0787967fcf608a266fb01cf62003b7e82a62f14645de8ce1acb98272ad0f9e05",
  DB_HOST: process.env.DB_HOST || "ec2-107-22-234-204.compute-1.amazonaws.com",
  DB_NAME: process.env.DB_NAME || "d6cill1kn2h06r",
  DB_SSL: process.env.DB_SSL || true,
  DB_PORT: process.env.DB_PORT || 5432,
  DB_MAX_POOL_SIZE: process.env.DB_MAX_POOL_SIZE || "5",
  //server configurations
  SERVER_PORT: process.env.SERVER_PORT || "8081",
  PORT: 8081,
	BODY_LIMIT: "100kb",
	CROS_HEADERS: ["Link"]
};
export default envVariables;
