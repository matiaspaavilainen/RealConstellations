interface Star {
	name: string;
	distance: number;
	distance_estimated: boolean;
	cartesian: number[];
}

interface Constellation {
	name: string;
	astronomical_data: Star[];
	general_info: string | null;
	connections: string[];
}

interface CameraControlsHandle {
	resetToDefault: () => void;
	moveToConstellation: (starDataArray: Star[]) => void;
}

export type { Constellation, Star, CameraControlsHandle };
