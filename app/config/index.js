const config = Object.freeze({
    development: {
      APP_NAME: "PATEL",
      DB_HOST: 'localhost',
      DB_DATABASE: '',
      DB_USER: 'root',
      DB_PASSWORD: '',
      JWT_TOKEN_SECRET: 'secret@samplenode',
      JWT_REFRESH_TOKEN_SECRET: 'refresh@samplenode',
      REFRESH_TOKEN_LIFE: 30 * 24 * 60 * 60,
      TOKEN_LIFE: 30 * 24 * 60 * 60,
      CLIENT_SECRET: 'ZTJOc2FXVnVkRWxrT2lJaUxDQnVZVzFsT2lKbGNHbGpaMlZ0Y3kxaFpHMXBiaUo5OmUyTnNhV1Z1ZEVsa09pSWlMQ0J1WVcxbG9pSmxjR2xqBjJWdGN5MWhaRzFwYmlKOQ==',
      CRYPTO_SECRET_KEY: 'UxDQnVZVzFsT2haRzF'
    }
  });
  
  module.exports = config.development;