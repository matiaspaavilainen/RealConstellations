import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import axios from "axios";
import { useEffect, useState } from "react";

import { ConstellationObject } from "./3dObjects";
import type { Constellation } from "./3dObjects";

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

const ConstellationCanvas = () => {
	const [constellations, setConstellations] = useState(Array<Constellation>);
	//const [selectedConstellation, setSelectedConstellation] = useState(null);

	useEffect(() => {
		getConstellations().then((constellations) => {
			if (Array.isArray(constellations)) {
				setConstellations(constellations);
			}
		});
	}, []);

	return (
		<div className="canvas-container">
			<Canvas
				id="canvas"
				// camera={{
				// 	fov: 75,
				// 	near: 0.01,
				// 	far: 10000,
				// 	position: [0, 0, 0.1],
				// }}
				frameloop="demand">
				{constellations.map((constellation) => (
					<ConstellationObject
						key={constellation.name}
						constellation={constellation}
					/>
				))}

				<PerspectiveCamera
					name="camera"
					makeDefault
					near={0.01}
					far={10000}
					position={[0, 0, 0.00000000001]}
				/>

				<OrbitControls
					reverseOrbit={true}
					enableZoom={false}
					rotateSpeed={0.185}
					target={[0, 0, 0]}
				/>
			</Canvas>
		</div>
	);
};

export default ConstellationCanvas;
