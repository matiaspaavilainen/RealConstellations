import { Vector3 } from "three";
import type { Constellation } from "./3dObjects";
import { useThree } from "@react-three/fiber";

const calculateCenter = (constellation: Constellation) => {
	const center = new Vector3(0, 0, 0);
	constellation.astronomical_data
		.map((s) => new Vector3(...s.cartesian))
		.forEach((p) => {
			center.add(p.divideScalar(constellation.astronomical_data.length));
		});
	return center;
};

const Project2d = (constellation: Constellation) => {
    const { camera } = useThree()
};

export { calculateCenter };
