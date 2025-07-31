import axios, {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
} from "axios";

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

let requestQueue: QueueItem[] = [];
let activeRequests = 0;

const apiClient: AxiosInstance = axios.create({
	baseURL: "https://api.brawlhalla.com/",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

apiClient.interceptors.request.use((config) => {
	if (!API_KEY) {
		throw new Error(
			'API key not set. Call setApiKey("YOUR_KEY") before making requests.',
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

			const customError = new Error(
				`Rate limit exceeded. Retry after ${retryAfter} seconds`,
			) as CustomError;

			customError.retryAfterMs = retryAfterMs;
			customError.isRateLimitError = true;

			return Promise.reject(customError);
		}

		return Promise.reject(error);
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

const queuedRequest = (
	path: string,
	config: AxiosRequestConfig,
): Promise<AxiosResponse> =>
	new Promise((resolve, reject) => {
		requestQueue.push({ config, path, resolve, reject });
	});

export function setApiKey(key: string) {
	API_KEY = key;

	return key;
}

export const request = {
	get: <T>(path: string, config?: AxiosRequestConfig) =>
		queuedRequest(path, { method: "get", ...config }) as Promise<
			AxiosResponse<T>
		>,

	post: <T>(path: string, data?: any, config?: AxiosRequestConfig) =>
		queuedRequest(path, { method: "post", data, ...config }) as Promise<
			AxiosResponse<T>
		>,

	put: <T>(path: string, data?: any, config?: AxiosRequestConfig) =>
		queuedRequest(path, { method: "put", data, ...config }) as Promise<
			AxiosResponse<T>
		>,

	delete: <T>(path: string, config?: AxiosRequestConfig) =>
		queuedRequest(path, { method: "delete", ...config }) as Promise<
			AxiosResponse<T>
		>,
};
