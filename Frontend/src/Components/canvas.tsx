import { CameraControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import axios from "axios";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { ConstellationObject } from "./constellationObject";
import { PerspectiveCamera as PerspectiveCameraType, Vector3 } from "three";
import type { Constellation } from "../types/types";

const getConstellations = async () => {
	try {
		const response = await axios.get("/api/constellations");
		const constellations = response.data["constellations"];

		const constellationArr: Array<Constellation> = [];

		constellations.forEach((constellation: Constellation) => {
			constellationArr.push(constellation);
		});

		return constellationArr;
	} catch (error) {
		console.error("Error fetching data:", error);
	}
};

const ConstellationCanvas = ({
	setSelectedConstellation,
}: {
	setSelectedConstellation: Dispatch<SetStateAction<string>>;
}) => {
	const [constellations, setConstellations] = useState(Array<Constellation>);
	const [mycam, setMyCam] = useState<PerspectiveCameraType | null>(null);

	useEffect(() => {
		getConstellations().then((constellations) => {
			if (Array.isArray(constellations)) {
				setConstellations(constellations);
			}
		});
	}, []);

	//distance to sun - sun diameter = approx distance to solar system barycenter in pc
	const approxEarthLocation = new Vector3(0.000004861 - 0.000000045, 0, 0);
	return (
		<div className="canvas-container">
			<Canvas
				id="canvas"
				frameloop="demand">
				{constellations.map((constellation) => (
					<ConstellationObject
						key={constellation.name}
						constellation={constellation}
						setSelectedConstellation={setSelectedConstellation}
					/>
				))}

				<PerspectiveCamera
					ref={setMyCam}
					makeDefault
					near={0.01}
					fov={60}
					far={20000}
					position={approxEarthLocation}
				/>

				{mycam && (
					<CameraControls
						camera={mycam}
						makeDefault
						azimuthRotateSpeed={-0.2}
						polarRotateSpeed={-0.2}
						dolly={false}
						truck={false}
					/>
				)}
			</Canvas>
		</div>
	);
};

export default ConstellationCanvas;
