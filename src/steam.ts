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

export const getSteamDataByURL = async (
	steamProfileURL: string,
): Promise<SteamData> => getSteamData(steamProfileURL);

export const getSteamDataBySteamID = async (
	steamID: string,
): Promise<SteamData> =>
	getSteamData("https://steamcommunity.com/profiles/" + steamID);

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

export const getBHIDFromSteamURL = async (
	steamProfileURL: string,
): Promise<number> => {
	const steamData = await getSteamDataByURL(steamProfileURL);

	return getBHIDFromSteamID(steamData.steam_id);
};

export const getStatsBySteamID = async (steamID: string) => {
	const brawlhallaId = await getBHIDFromSteamID(steamID);

	return getStatsByBHID(brawlhallaId);
};

export const getStatsBySteamURL = async (steamProfileURL: string) => {
	const brawlhallaId = await getBHIDFromSteamURL(steamProfileURL);

	return getStatsByBHID(brawlhallaId);
};

export const getRankedBySteamID = async (steamID: string) => {
	const brawlhallaId = await getBHIDFromSteamID(steamID);

	return getRankedByBHID(brawlhallaId);
};

export const getRankedBySteamURL = async (steamProfileURL: string) => {
	const brawlhallaId = await getBHIDFromSteamURL(steamProfileURL);

	return getRankedByBHID(brawlhallaId);
};

export const getGloryFromSteamID = async (steamID: string) => {
	const brawlhallaId = await getBHIDFromSteamID(steamID);

	return getGloryByBHID(brawlhallaId);
};

export const getGloryFromSteamURL = async (steamProfileURL: string) => {
	const brawlhallaId = await getBHIDFromSteamURL(steamProfileURL);

	return getGloryByBHID(brawlhallaId);
};
