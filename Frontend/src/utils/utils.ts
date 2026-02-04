import { Vector3 } from "three";
import type { Star } from "../types/types";

const sortByName = (a: Star, b: Star) => {
	if (a.name > b.name) return 1;
	if (b.name > a.name) return -1;
	else return 0;
};

const sortByDistance = (a: Star, b: Star) => {
	if (a.distance > b.distance) return 1;
	if (b.distance > a.distance) return -1;
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

const distanceToLyFormat = (distance: number, digits: number = 2) => {
	return (distance * 3.26156).toFixed(digits) + " ly";
};

const formatDistanceInfo = (stars: Star[]) => {
	const averageDistance =
		stars.reduce((sum, star) => sum + star.distance, 0) / stars.length;
	const sortedByDistance = stars.toSorted(
		(a: Star, b: Star) => a.distance - b.distance,
	);

	// stars can't be null when this function is called
	const nearestStar = sortedByDistance.at(0)!.distance;
	const farthestStar = sortedByDistance.at(-1)!.distance;
	return [averageDistance, nearestStar, farthestStar];
};

export {
	calculateCenter,
	calculateProjectedCenter,
	sortByName,
	sortByDistance,
	distanceToLyFormat,
	formatDistanceInfo,
};
