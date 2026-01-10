import {
	CameraControls,
	FirstPersonControls,
	Line,
	OrbitControls,
	OrthographicCamera,
	PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import axios from "axios";
import { useEffect, useState } from "react";

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
		console.error("Error fetching photos:", error);
	}
};

const StarObject = ({
	name,
	position,
	distance,
}: {
	name: string;
	position: number[];
	distance: number;
}) => {
	return (
		<mesh
			position={position}
			onClick={() => {
				console.log(name);
			}}>
			<sphereGeometry args={[distance / 10]} />
			<meshBasicMaterial color={"white"} />
		</mesh>
	);
};

const ConnectingLine = ({ start, end }: { start: number[]; end: number[] }) => {
	return (
		<mesh>
			<Line
				points={[start, end]}
				lineWidth={2}
			/>
			<lineBasicMaterial color={"white"} />
		</mesh>
	);
};

const ConstellationObject = ({
	constellation,
}: {
	constellation: Constellation;
}) => {
	const lines: number[][][] = [];
	constellation.connections.forEach((pair) => {
		const start =
			constellation.astronomical_data[Number.parseInt(pair.split("-")[0])]
				.cartesian;
		const end =
			constellation.astronomical_data[Number.parseInt(pair.split("-")[1])]
				.cartesian;
		lines.push([start, end]);
	});

	const scale = 10;

	const stars = constellation.astronomical_data.map((star: Star) => (
		<StarObject
			key={star.name}
			name={star.name}
			position={star.cartesian.map((x) => x * scale)}
			distance={star.distance}
		/>
	));

	const connections = lines.map((pair) => (
		<ConnectingLine
			key={constellation.name + lines.indexOf(pair)}
			start={pair[0].map((x) => x * scale)}
			end={pair[1].map((x) => x * scale)}
		/>
	));

	return stars.concat(connections);
};

const Basic = () => {
	const [constellations, setConstellations] = useState(Array<Constellation>);

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
					makeDefault
					near={0.01}
					far={50000}
					position={[0, 0, 0.01]} // Tiny offset
				/>
				<OrbitControls />
			</Canvas>
		</div>
	);
};

export default Basic;
