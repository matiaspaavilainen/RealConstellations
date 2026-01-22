interface Star {
	name: string;
	ra: number;
	dec: number;
	pm_ra: number;
	pm_dec: number;
	distance: number;
	distance_estimated: boolean;
	cartesian: number[];
	cartesian_velocity: number[];
}

interface Constellation {
	name: string;
	astronomical_data: Star[];
	general_info: string | null;
	connections: string[];
}

export type { Constellation, Star };
