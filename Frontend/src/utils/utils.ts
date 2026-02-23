import { Vector3 } from "three";
import type { CameraControlsHandle, Star } from "../types/types";
import { forwardRef, useImperativeHandle } from "react";
import type { CameraControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

const sortByName = (a: Star, b: Star) => {
	if (a.name > b.name) return 1;
	if (b.name > a.name) return -1;
	else return 0;
};

const sortByDistance = (a: Star, b: Star) => {
	if (a.distance < b.distance) return 1;
	if (b.distance < a.distance) return -1;
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

const CameraControlsExposer = forwardRef<CameraControlsHandle, object>(
	(_, ref) => {
		const { controls } = useThree<{ controls: CameraControls }>();

		useImperativeHandle(
			ref,
			() => ({
				resetToDefault: () => {
					controls.setLookAt(
						0.000004861 - 0.000000045,
						0,
						0,
						0,
						0,
						0,
						true,
					);
				},

				moveToConstellation: (starDataArray: Star[]) => {
					// center point of the constellation to orbit around
					const calculatedConstellationCenter: Vector3 =
						calculateCenter(starDataArray);
					// Direction of Earth
					const viewFromEarthVec: Vector3 = new Vector3()
						.copy(calculatedConstellationCenter)
						.negate();

					const nearestStarPosition =
						starDataArray.toSorted(sortByDistance)[0].cartesian;

					// set the lenght of the
					const lookFromEarth: Vector3 = viewFromEarthVec.setLength(
						new Vector3(0, 0, 0).distanceTo(
							new Vector3(...nearestStarPosition),
						) / 150,
					);

					controls.setLookAt(
						lookFromEarth.x,
						lookFromEarth.y,
						lookFromEarth.z,
						calculatedConstellationCenter.x,
						calculatedConstellationCenter.y,
						calculatedConstellationCenter.z,
						true,
					);
				},
			}),
			[controls],
		);

		return null;
	},
);

export {
	CameraControlsExposer,
	calculateCenter,
	calculateProjectedCenter,
	sortByName,
	sortByDistance,
	distanceToLyFormat,
	formatDistanceInfo,
};
