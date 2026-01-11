import { Billboard, Line, Text } from "@react-three/drei";

import { DoubleSide, Shape, Vector3 } from "three";
import { calculateCenter } from "./helpers";
import { useMemo } from "react";

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

const StarObject = ({
	name,
	position,
	distance,
}: {
	name: string;
	position: Vector3;
	distance: number;
}) => {
	return (
		<mesh
			position={position}
			onClick={() => {
				console.log(name);
			}}>
			<sphereGeometry args={[distance / 350]} />
			<meshBasicMaterial color={"white"} />
		</mesh>
	);
};

const ConnectingLine = ({ start, end }: { start: Vector3; end: Vector3 }) => {
	return (
		<mesh>
			<Line
				points={[start, end]}
				lineWidth={1}
			/>
			<lineBasicMaterial color={"white"} />
		</mesh>
	);
};

const ConstellationMarker = ({
	constellation,
}: {
	constellation: Constellation;
}) => {
	const origin = new Vector3(0, 0, 0.00000000001);
	const center = calculateCenter(constellation);

	const shape = new Shape().absarc(
		0,
		0,
		origin.distanceTo(center) / 100,
		0,
		Math.PI * 2,
		false
	);

	return (
		<>
			<Billboard position={center}>
				<Text
					fontSize={origin.distanceTo(center) / 50}
					color="white">
					{constellation.name}
				</Text>
			</Billboard>
			<mesh
				onUpdate={(self) => {
					self.lookAt(origin);
				}}
				position={center}>
				<shapeGeometry args={[shape]} />
				<meshBasicMaterial
					color={"red"}
					side={DoubleSide}
				/>
			</mesh>
		</>
	);
};

const ConstellationObject = ({
	constellation,
}: {
	constellation: Constellation;
}) => {
	const lines = useMemo(() => {
		const result: number[][][] = [];
		constellation.connections.forEach((pair) => {
			const [s, e] = pair
				.split("-")
				.map(
					(i) =>
						constellation.astronomical_data[Number.parseInt(i)]
							.cartesian
				);
			result.push([s, e]);
		});
		return result;
	}, [constellation]);

	const scale = 1;

	return (
		<>
			{constellation.astronomical_data.map((star: Star) => (
				<StarObject
					key={star.name}
					name={star.name}
					position={
						new Vector3(...star.cartesian.map((x) => x * scale))
					}
					distance={star.distance}
				/>
			))}
			{lines.map((pair) => (
				<ConnectingLine
					key={constellation.name + lines.indexOf(pair)}
					start={new Vector3(...pair[0].map((x) => x * scale))}
					end={new Vector3(...pair[1].map((x) => x * scale))}
				/>
			))}

			<ConstellationMarker
				key={constellation.name}
				constellation={constellation}
			/>
		</>
	);
};

export { ConstellationObject };
export type { Constellation };
