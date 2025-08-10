import axios, {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
} from "axios";
import { BHAPIError, QueueItem } from "./types";

let API_KEY: string | null = null;
const MAX_CALLS_PER_SECOND = 10;
const MAX_QUEUE_LENGTH = 500;

let requestQueue: QueueItem[] = [];
let activeRequests = 0;

/**
 * Axios instance for Brawlhalla API. USE `bhapi.request` EXPORTS FOR CUSTOM REQUESTS
 */
export const apiClient: AxiosInstance = axios.create({
	baseURL: "https://api.brawlhalla.com/",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

apiClient.interceptors.request.use((config) => {
	if (!API_KEY) {
		throw new BHAPIError(
			'API key not set. Call setApiKey("YOUR_KEY") before making requests.',
			{
				code: "API_KEY_NOT_SET",
				status: 400,
				details: "API key is required for making requests.",
			},
		);
	}

	config.params = {
		...config.params,
		api_key: API_KEY,
	};

	return config;
});

apiClient.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		if (error.response?.status === 429) {
			const retryAfter = parseInt(
				error.response.headers["retry-after"] || "1",
				10,
			);
			const retryAfterMs = retryAfter * 1000;

			throw new BHAPIError(
				`Rate limit exceeded. Retry after ${retryAfter} seconds`,
				{
					code: error.response.statusText,
					status: error.response.status,
					details: {
						retryAfterMs,
						isRateLimitError: true,
					},
				},
			);
		}

		throw new BHAPIError(error.message, {
			code: error.response?.statusText || "Unknown Error",
			status: error.response?.status || 500,
			details: error.config?.url,
		});
	},
);

setInterval(() => {
	while (activeRequests < MAX_CALLS_PER_SECOND && requestQueue.length > 0) {
		const item = requestQueue.shift();
		if (item) {
			activeRequests++;

			apiClient(item.path, item.config)
				.then((response) => item.resolve(response))
				.catch((error) => item.reject(error))
				.finally(() => {
					activeRequests--;
				});
		}
	}
}, 100);

const queuedRequest = <T>(
	path: string,
	config: AxiosRequestConfig,
): Promise<AxiosResponse<T>> =>
	new Promise((resolve, reject) => {
		if (requestQueue.length >= MAX_QUEUE_LENGTH)
			reject(
				new BHAPIError("Request queue overflow", {
					code: "QUEUE_OVERFLOW",
					status: 503,
					details:
						"The request queue has reached its maximum length.",
				}),
			);
		else requestQueue.push({ config, path, resolve, reject });
	});

/**
 * Set the API key for authentication
 *
 * @param {string} key Brawlhalla API key
 * @returns {string} The API key that was set
 */
export function setApiKey(key: string) {
	API_KEY = key;

	return key;
}

/**
 * Request methods for Brawlhalla API
 */
export const request = {
	/**
	 * Send a GET request to the Brawlhalla API
	 *
	 * @param {string} path API endpoint path
	 * @param {AxiosRequestConfig} config Axios request configuration
	 * @returns {Promise<AxiosResponse<T>>} Promise resolving to the API response
	 */
	get: <T>(path: string, config?: AxiosRequestConfig) =>
		queuedRequest<T>(path, { method: "get", ...config }),

	/**
	 * Send a POST request to the Brawlhalla API
	 *
	 * @param {string} path API endpoint path
	 * @param {any} data Request payload
	 * @param {AxiosRequestConfig} config Axios request configuration
	 * @returns {Promise<AxiosResponse<T>>} Promise resolving to the API response
	 */
	post: <T>(path: string, data?: any, config?: AxiosRequestConfig) =>
		queuedRequest<T>(path, { method: "post", data, ...config }),

	/**
	 * Send a PUT request to the Brawlhalla API
	 *
	 * @param {string} path API endpoint path
	 * @param {any} data Request payload
	 * @param {AxiosRequestConfig} config Axios request configuration
	 * @returns {Promise<AxiosResponse<T>>} Promise resolving to the API response
	 */
	put: <T>(path: string, data?: any, config?: AxiosRequestConfig) =>
		queuedRequest<T>(path, { method: "put", data, ...config }),

	/**
	 * Send a DELETE request to the Brawlhalla API
	 *
	 * @param {string} path API endpoint path
	 * @param {AxiosRequestConfig} config Axios request configuration
	 * @returns {Promise<AxiosResponse<T>>} Promise resolving to the API response
	 */
	delete: <T>(path: string, config?: AxiosRequestConfig) =>
		queuedRequest<T>(path, { method: "delete", ...config }),
};
