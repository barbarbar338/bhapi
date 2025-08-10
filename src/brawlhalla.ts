import { AxiosResponse } from "axios";
import { request } from "./client";
import {
	BHAPIError,
	Clan,
	GloryData,
	PlayerRanked,
	PlayerStats,
	RankingResponse,
	RankingsOptions,
	RankingTypes,
	StaticAllLegends,
	StaticLegend,
} from "./types";

const bestRating = (rank: PlayerRanked) => {
	let ratings: { peak_rating: number }[] = [rank, ...rank.legends];
	if (rank["2v2"] && rank["2v2"].length > 0)
		ratings = [...ratings, ...rank["2v2"]];

	const peak = ratings.map((r) => r.peak_rating);

	return Math.max(...peak);
};

const gloryFromWins = (totalwins: number): number => {
	if (totalwins <= 150) return 20 * totalwins;

	return Math.floor(10 * (45 * Math.pow(Math.log10(totalwins * 2), 2)) + 245);
};

const gloryFromBestRating = (bestrating: number): number => {
	let retval = 0;

	if (bestrating < 1200) retval = 250;

	if (bestrating >= 1200 && bestrating < 1286)
		retval = 10 * (25 + 0.872093023 * (86 - (1286 - bestrating)));

	if (bestrating >= 1286 && bestrating < 1390)
		retval = 10 * (100 + 0.721153846 * (104 - (1390 - bestrating)));

	if (bestrating >= 1390 && bestrating < 1680)
		retval = 10 * (187 + 0.389655172 * (290 - (1680 - bestrating)));

	if (bestrating >= 1680 && bestrating < 2000)
		retval = 10 * (300 + 0.428125 * (320 - (2000 - bestrating)));

	if (bestrating >= 2000 && bestrating < 2300)
		retval = 10 * (437 + 0.143333333 * (300 - (2300 - bestrating)));

	if (bestrating >= 2300)
		retval = 10 * (480 + 0.05 * (400 - (2700 - bestrating)));

	return Math.floor(retval);
};

const newEloFromOldElo = (elo: number) => {
	if (elo >= 1400)
		return Math.floor(1400 + (elo - 1400) / (3 - (3000 - elo) / 800));

	return elo;
};

/**
 * Get Brawlhalla ID from player name
 *
 * @param {string} name Player name
 * @returns {number} Brawlhalla ID of the player
 */
export const getBHIDFromName = async (name: string): Promise<number> => {
	const res = await request.get<PlayerStats[]>("rankings/1v1/all/1", {
		params: {
			name,
		},
	});

	if (res.data.length === 0)
		throw new BHAPIError(`Player with name "${name}" not found.`, {
			code: res.statusText,
			status: res.status,
			details: res.config.url,
		});

	return res.data[0].brawlhalla_id;
};

/**
 * Get player stats by Brawlhalla ID
 *
 * @param {number} brawlhallaId Brawlhalla ID of the player
 * @returns {Promise<AxiosResponse<PlayerStats>>} Player stats
 */
export const getStatsByBHID = (
	brawlhallaId: number,
): Promise<AxiosResponse<PlayerStats>> =>
	request.get<PlayerStats>(`player/${brawlhallaId}/stats`);

/**
 * Get player stats by name
 *
 * @param {string} name Player name
 * @returns {Promise<AxiosResponse<PlayerStats>>} Player stats
 */
export const getStatsByName = async (name: string) => {
	const brawlhallaId = await getBHIDFromName(name);

	return getStatsByBHID(brawlhallaId);
};

/**
 * Get player ranked stats by Brawlhalla ID
 *
 * @param {number} brawlhallaId Brawlhalla ID of the player
 * @returns {Promise<AxiosResponse<PlayerRanked>>} Player ranked stats
 */
export const getRankedByBHID = (
	brawlhallaId: number,
): Promise<AxiosResponse<PlayerRanked>> =>
	request.get<PlayerRanked>(`player/${brawlhallaId}/ranked`);

/**
 * Get clan by ID
 *
 * @param {number} clanID Brawlhalla clan ID
 * @returns {Promise<AxiosResponse<Clan>>} Clan data
 */
export const getClanByID = (clanID: number): Promise<AxiosResponse<Clan>> =>
	request.get<Clan>(`clan/${clanID}`);

/**
 * Get all legends
 *
 * @returns {Promise<AxiosResponse<StaticAllLegends[]>>} All legends
 */
export const getAllLegends = async (): Promise<
	AxiosResponse<StaticAllLegends[]>
> => request.get<StaticAllLegends[]>("legend/all");

/**
 * Get legend by ID
 *
 * @param {number} legendID Brawlhalla legend ID
 * @returns {Promise<AxiosResponse<StaticLegend>>} Legend data
 */
export const getLegendByID = async (
	legendID: number,
): Promise<AxiosResponse<StaticLegend>> =>
	request.get<StaticLegend>(`legend/${legendID}`);

/**
 * Get legend by name
 *
 * @param {string} name Legend name
 * @returns {Promise<AxiosResponse<StaticLegend>>} Legend data
 */
export const getLegendByName = async (
	name: string,
): Promise<AxiosResponse<StaticLegend>> => {
	const getAllLegendsResponse = await getAllLegends();
	const legends = getAllLegendsResponse.data;

	const legend = legends.find(
		(legend) => legend.legend_name_key.toLowerCase() === name.toLowerCase(),
	);

	if (!legend)
		throw new BHAPIError(`Legend with name "${name}" not found.`, {
			code: "LegendNotFound",
			status: 404,
			details: `No legend found with name "${name}"`,
		});

	return getLegendByID(legend.legend_id);
};

/**
 * Get glory data by Brawlhalla ID
 *
 * @param {number} brawlhallaId Brawlhalla ID of the player
 * @returns {Promise<GloryData>} Glory data
 */
export const getGloryByBHID = async (
	brawlhallaId: number,
): Promise<GloryData> => {
	const res = await getRankedByBHID(brawlhallaId);

	let { games, wins } = res.data;
	if (res.data["2v2"] && res.data["2v2"].length > 0)
		res.data["2v2"].forEach((data) => {
			wins += data.wins;
			games += data.games;
		});

	const bestElo = bestRating(res.data);
	const glory =
		games < 10
			? { wins: 0, rating: 0 }
			: {
					wins: gloryFromWins(wins),
					rating: gloryFromBestRating(bestElo),
				};
	const eloReset = newEloFromOldElo(res.data.rating);

	return {
		brawlhalla_id: res.data.brawlhalla_id,
		name: res.data.name,
		bestElo,
		eloReset,
		glory,
	};
};

/**
 * Get player rankings
 *
 * @param {RankingsOptions<RankingTypes>} rankingOptions Ranking options
 * @returns {Promise<AxiosResponse<RankingResponse<RankingTypes>>>} Player rankings
 */
export const getRankings = async <T extends RankingTypes>({
	page,
	region,
	type,
}: RankingsOptions<T>): Promise<AxiosResponse<RankingResponse<T>>> =>
	request.get<RankingResponse<T>>(`rankings/${type}/${region}/${page}`);
