import axios from "axios";
import { parseStringPromise } from "xml2js";
import { getGloryByBHID, getRankedByBHID, getStatsByBHID } from "./brawlhalla";
import { request } from "./client";
import { BHAPIError, PlayerStats, SteamData } from "./types";

const steamURLRegex =
	/^https?:\/\/steamcommunity\.com\/(id|profiles)\/[a-zA-Z0-9_-]+\/?$/;

const validateURL = (url: string) => steamURLRegex.test(url);

const getSteamData = async (url: string): Promise<SteamData> => {
	if (!validateURL(url))
		throw new BHAPIError("Not a valid Steam profile URL: " + url, {
			code: "InvalidSteamURL",
			status: 400,
			details: `The provided URL "${url}" does not match the expected Steam profile format.`,
		});

	const xml = await axios
		.get(url, {
			params: { xml: 1 },
		})
		.then((r) => {
			if (r.status > 199 && r.status < 300) return r.data as string;
			else
				throw new BHAPIError("Not a valid Steam profile URL: " + url, {
					code: "InvalidSteamURL",
					status: 400,
					details: `The provided URL "${url}" does not match the expected Steam profile format.`,
				});
		})
		.catch(() => {
			throw new BHAPIError("Not a valid Steam profile URL: " + url, {
				code: "InvalidSteamURL",
				status: 400,
				details: `The provided URL "${url}" does not match the expected Steam profile format.`,
			});
		});

	const result = (await parseStringPromise(xml).catch(() => {
		throw new BHAPIError("Not a valid Steam profile URL: " + url, {
			code: "InvalidSteamURL",
			status: 400,
			details: `The provided URL "${url}" does not match the expected Steam profile format.`,
		});
	})) as {
		profile: {
			steamID: string[];
			steamID64: string[];
		};
	};

	if (result.profile && result.profile.steamID64)
		return {
			name: result.profile.steamID[0],
			steam_id: result.profile.steamID64[0],
			steam_url:
				"https://steamcommunity.com/profiles/" +
				result.profile.steamID64[0],
		};
	else
		throw new BHAPIError("Not a valid Steam profile URL: " + url, {
			code: "InvalidSteamURL",
			status: 400,
			details: `The provided URL "${url}" does not match the expected Steam profile format.`,
		});
};

/**
 * Get Steam data by profile URL
 *
 * @param {string} steamProfileURL Steam profile URL
 * @returns {Promise<SteamData>} Promise resolving to the Steam data
 */
export const getSteamDataByURL = async (
	steamProfileURL: string,
): Promise<SteamData> => getSteamData(steamProfileURL);

/**
 * Get Steam data by Steam ID
 *
 * @param {string} steamID Steam ID
 * @returns {Promise<SteamData>} Promise resolving to the Steam data
 */
export const getSteamDataBySteamID = async (
	steamID: string,
): Promise<SteamData> =>
	getSteamData("https://steamcommunity.com/profiles/" + steamID);

/**
 * Get Brawlhalla ID from Steam ID
 *
 * @param {string} steamID Steam ID
 * @returns {Promise<number>} Promise resolving to the Brawlhalla ID
 */
export const getBHIDFromSteamID = async (steamID: string): Promise<number> => {
	const { data } = await request.get<PlayerStats[]>("search", {
		params: {
			steamid: steamID,
		},
	});

	if (data.length === 0)
		throw new BHAPIError("No player found with this Steam ID: " + steamID, {
			code: "PlayerNotFound",
			status: 404,
			details: `No player found with Steam ID "${steamID}"`,
		});

	return data[0].brawlhalla_id;
};

/**
 * Get Brawlhalla ID from Steam profile URL
 *
 * @param {string} steamProfileURL Steam profile URL
 * @returns {Promise<number>} Promise resolving to the Brawlhalla ID
 */
export const getBHIDFromSteamURL = async (
	steamProfileURL: string,
): Promise<number> => {
	const steamData = await getSteamDataByURL(steamProfileURL);

	return getBHIDFromSteamID(steamData.steam_id);
};

/**
 * Get Brawlhalla stats by Steam ID
 *
 * @param {string} steamID Steam ID
 * @returns {Promise<BrawlhallaStats>} Promise resolving to the Brawlhalla stats
 */
export const getStatsBySteamID = async (steamID: string) => {
	const brawlhallaId = await getBHIDFromSteamID(steamID);

	return getStatsByBHID(brawlhallaId);
};

/**
 * Get Brawlhalla stats by Steam profile URL
 *
 * @param {string} steamProfileURL Steam profile URL
 * @returns {Promise<BrawlhallaStats>} Promise resolving to the Brawlhalla stats
 */
export const getStatsBySteamURL = async (steamProfileURL: string) => {
	const brawlhallaId = await getBHIDFromSteamURL(steamProfileURL);

	return getStatsByBHID(brawlhallaId);
};

/**
 * Get Brawlhalla ranked data by Steam ID
 *
 * @param {string} steamID Steam ID
 * @returns {Promise<BrawlhallaRankedData>} Promise resolving to the Brawlhalla ranked data
 */
export const getRankedBySteamID = async (steamID: string) => {
	const brawlhallaId = await getBHIDFromSteamID(steamID);

	return getRankedByBHID(brawlhallaId);
};

/**
 * Get Brawlhalla ranked data by Steam profile URL
 *
 * @param {string} steamProfileURL Steam profile URL
 * @returns {Promise<BrawlhallaRankedData>} Promise resolving to the Brawlhalla ranked data
 */
export const getRankedBySteamURL = async (steamProfileURL: string) => {
	const brawlhallaId = await getBHIDFromSteamURL(steamProfileURL);

	return getRankedByBHID(brawlhallaId);
};

/**
 * Get Brawlhalla glory by Steam ID
 *
 * @param {string} steamID Steam ID
 * @returns {Promise<number>} Promise resolving to the Brawlhalla glory
 */
export const getGloryFromSteamID = async (steamID: string) => {
	const brawlhallaId = await getBHIDFromSteamID(steamID);

	return getGloryByBHID(brawlhallaId);
};

/**
 * Get Brawlhalla glory by Steam profile URL
 *
 * @param {string} steamProfileURL Steam profile URL
 * @returns {Promise<number>} Promise resolving to the Brawlhalla glory
 */
export const getGloryFromSteamURL = async (steamProfileURL: string) => {
	const brawlhallaId = await getBHIDFromSteamURL(steamProfileURL);

	return getGloryByBHID(brawlhallaId);
};
