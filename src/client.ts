import axios, {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
} from "axios";
import { BHAPIError } from "./types";

export type QueueItem = {
	config: AxiosRequestConfig;
	path: string;
	resolve: (value: AxiosResponse) => void;
	reject: (reason?: any) => void;
};

export type CustomError = Error & {
	retryAfterMs: number;
	isRateLimitError: boolean;
};

let API_KEY: string | null = null;
const MAX_CALLS_PER_SECOND = 10;
const MAX_QUEUE_LENGTH = 500;

let requestQueue: QueueItem[] = [];
let activeRequests = 0;

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

export function setApiKey(key: string) {
	API_KEY = key;

	return key;
}

export const request = {
	get: <T>(path: string, config?: AxiosRequestConfig) =>
		queuedRequest<T>(path, { method: "get", ...config }),

	post: <T>(path: string, data?: any, config?: AxiosRequestConfig) =>
		queuedRequest<T>(path, { method: "post", data, ...config }),

	put: <T>(path: string, data?: any, config?: AxiosRequestConfig) =>
		queuedRequest<T>(path, { method: "put", data, ...config }),

	delete: <T>(path: string, config?: AxiosRequestConfig) =>
		queuedRequest<T>(path, { method: "delete", ...config }),
};
