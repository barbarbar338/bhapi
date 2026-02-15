import { AxiosRequestConfig, AxiosResponse } from "axios";

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

export type SteamData = {
	name: string;
	steam_id: string;
	steam_url: string;
};

export type BHIDFromSteamID = {
	name: string;
	brawlhalla_id: number;
};

export type GloryData = {
	brawlhalla_id: number;
	name: string;
	bestElo: number;
	eloReset: number;
	glory: {
		wins: number;
		rating: number;
	};
};

export type RankingsOptions<T extends RankingTypes = "1v1"> = {
	type: T;
	region: RankedRegion;
	page: string | number;
};

export type RankingResponse<T extends RankingTypes = "1v1"> = T extends "1v1"
	? Ranking1v1[]
	: T extends "2v2"
		? Ranking2v2[]
		: T extends "seasonal"
			? RankingSeasonal[]
			: never;

export type PlayerStats = {
	brawlhalla_id: number;
	name: string;
	xp: number;
	level: number;
	xp_percentage: number;
	games: number;
	wins: number;
	damagebomb: string;
	damagemine: string;
	damagespikeball: string;
	damagesidekick: string;
	hitsnowball: number;
	kobomb: number;
	komine: number;
	kospikeball: number;
	kosidekick: number;
	kosnowball: number;
	legends: LegendStats[];
	clan: PlayerClan | undefined;
};

export type LegendStats = {
	legend_id: number;
	legend_name_key: string;
	damagedealt: string;
	damagetaken: string;
	kos: number;
	falls: number;
	suicides: number;
	teamkos: number;
	matchtime: number;
	games: number;
	wins: number;
	damageunarmed: string;
	damagethrownitem: string;
	damageweaponone: string;
	damageweapontwo: string;
	damagegadgets: string;
	kounarmed: number;
	kothrownitem: number;
	koweaponone: number;
	koweapontwo: number;
	kogadgets: number;
	timeheldweaponone: number;
	timeheldweapontwo: number;
	xp: number;
	level: number;
	xp_percentage: number;
};

export type PlayerClan = {
	clan_name: string;
	clan_id: number;
	clan_xp: string;
	personal_xp: number;
};

export type PlayerRanked = PlayerSeason & {
	name: string;
	brawlhalla_id: number;
	global_rank: number;
	region_rank: number;
	legends: LegendRanked[];
	"2v2": T2v2Team[];
};

export type PlayerSeason = {
	rating: number;
	peak_rating: number;
	tier: RankedTier;
	wins: number;
	games: number;
	region: RankedRegion;
};

export type LegendRanked = {
	legend_id: number;
	legend_name_key: string;
	rating: number;
	peak_rating: number;
	tier: RankedTier;
	wins: number;
	games: number;
};

export type T2v2Team = {
	brawlhalla_id_one: number;
	brawlhalla_id_two: number;
	rating: number;
	peak_rating: number;
	tier: RankedTier;
	wins: number;
	games: number;
	teamname: string;
	region: RankedRegion;
	global_rank: number;
};

export type Clan = {
	clan_id: number;
	clan_name: string;
	clan_create_date: number;
	clan_xp: string;
	clan: ClanMember[];
};

export type ClanMember = {
	brawlhalla_id: number;
	name: string;
	rank: ClanRank;
	join_date: number;
	xp: number;
};

export type Ranking = {
	rank: number;
	rating: number;
	tier: RankedTier;
	games: number;
	wins: number;
	region: RankedRegion;
	peak_rating: number;
};

export type Ranking1v1 = Ranking & {
	name: string;
	brawlhalla_id: number;
	best_legend: number;
	best_legend_games: number;
	best_legend_wins: number;
	twitch_name?: string;
};

export type Ranking2v2 = Ranking & {
	teamname: string;
	brawlhalla_id_one: number;
	brawlhalla_id_two: number;
	twitch_name_one?: string;
	twitch_name_two?: string;
};

export type RankingSeasonal = Ranking & {
	name: string;
	brawlhalla_id: number;
};

export type StaticAllLegends = {
	legend_id: number;
	legend_name_key: string;
	bio_name: string;
	bio_aka: string;
	weapon_one: string;
	weapon_two: string;
	strength: string;
	dexterity: string;
	defense: string;
	speed: string;
};

export type StaticLegend = StaticAllLegends & {
	bio_quote: string;
	bio_quote_about_attrib: string;
	bio_quote_from: string;
	bio_quote_from_attrib: string;
	bio_text: string;
	bot_name: string;
};

export type ClanRank = "Leader" | "Officer" | "Member" | "Recruit";

export type RankedTier =
	| "Diamond"
	| "Platinum 5"
	| "Platinum 4"
	| "Platinum 3"
	| "Platinum 2"
	| "Platinum 1"
	| "Gold 5"
	| "Gold 4"
	| "Gold 3"
	| "Gold 2"
	| "Gold 1"
	| "Gold 0"
	| "Silver 5"
	| "Silver 4"
	| "Silver 3"
	| "Silver 2"
	| "Silver 1"
	| "Silver 0"
	| "Bronze 5"
	| "Bronze 4"
	| "Bronze 3"
	| "Bronze 2"
	| "Bronze 1"
	| "Bronze 0"
	| "Tin 5"
	| "Tin 4"
	| "Tin 3"
	| "Tin 2"
	| "Tin 1"
	| "Tin 0";

export type RankedRegion =
	| "all"
	| "ALL"
	| "us-e"
	| "US-E"
	| "eu"
	| "EU"
	| "sea"
	| "SEA"
	| "brz"
	| "BRZ"
	| "aus"
	| "AUS"
	| "us-w"
	| "US-W"
	| "jpn"
	| "JPN";

export type RankingTypes = "1v1" | "2v2" | "seasonal";

export class BHAPIError<T> extends Error {
	code: string;
	status: number;
	details: T;

	constructor(
		message: string,
		options: {
			code: string;
			status: number;
			details: T;
		},
	) {
		super(message);

		this.name = "ApiError";
		this.code = options.code;
		this.status = options.status;
		this.details = options.details;

		Object.setPrototypeOf(this, new.target.prototype);
	}
}
