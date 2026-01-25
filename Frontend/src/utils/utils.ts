import { Vector3 } from "three";
import type { Star } from "../types/types";

const sortByName = (a: Star, b: Star) => {
	if (a.name > b.name) return 1;
	if (b.name > a.name) return -1;
	else return 0;
};

const calculateProjectedCenter = (starDataArray: Star[]) => {
	const center = new Vector3(0, 0, 0);
	starDataArray
		.map((star) => {
			return new Vector3(...star.cartesian).normalize();
		})
		.forEach((p) => {
			center.add(p.divideScalar(starDataArray.length));
		});
	return center;
};

const calculateCenter = (starDataArray: Star[]) => {
	const center = new Vector3(0, 0, 0);
	starDataArray
		.map((star) => {
			return new Vector3(...star.cartesian);
		})
		.forEach((p) => {
			center.add(p.divideScalar(starDataArray.length));
		});
	return center;
};

export { calculateCenter, calculateProjectedCenter, sortByName };
