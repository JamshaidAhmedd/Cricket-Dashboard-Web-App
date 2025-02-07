// utils/axiosInstance.js
const axios = require('axios');
const axiosRetry = require('axios-retry');
const logger = require('./logger');

const axiosInstance = axios.create({
  baseURL: 'https://api.cricapi.com/v1',
  timeout: 10000, // 10 seconds
});

// Configure Axios to retry failed requests
axiosRetry(axiosInstance, {
  retries: 3, // Number of retries
  retryDelay: (retryCount) => retryCount * 2000, // Delay between retries (in ms)
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response && error.response.status === 429) // Retry on rate limit
    );
  },
  onRetry: (retryCount, error, requestConfig) => {
    logger.warn(
      `Retrying request to ${requestConfig.url} (${retryCount}/3) due to error: ${error.message}`
    );
  },
});

module.exports = axiosInstance;
