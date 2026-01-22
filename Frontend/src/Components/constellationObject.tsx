import { Billboard, Line, Text } from "@react-three/drei";

import { Vector3 } from "three";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

import { calculateProjectedCenter } from "../utils/utils";
import type { Constellation, Star } from "../types/types";

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
				console.log(name, distance * 3.26156);
			}}>
			{/* normalized size */}
			<sphereGeometry args={[distance / 300]} />
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
	name,
	starDataArray,
	setSelectedConstellation,
}: {
	name: string;
	starDataArray: Star[];
	setSelectedConstellation: Dispatch<SetStateAction<string>>;
}) => {
	// the point where the text should be at
	const center = calculateProjectedCenter(starDataArray);

	const [hovered, setHovered] = useState(false);

	return (
		<Billboard
			position={center}
			onPointerEnter={() => {
				setHovered(true);
			}}
			onPointerLeave={() => {
				setHovered(false);
			}}>
			<Text
				fontSize={0.018}
				outlineWidth={hovered ? "20%" : "0%"}
				outlineColor={hovered ? "white" : "transparent"}
				outlineBlur={hovered ? "50%" : "0%"}
				outlineOpacity={hovered ? 0.8 : 0}
				color={hovered ? "black" : "white"}
				onClick={() => setSelectedConstellation(name)}>
				{name}
			</Text>
		</Billboard>
	);
};

const ConstellationObject = ({
	constellation,
	setSelectedConstellation,
}: {
	constellation: Constellation;
	setSelectedConstellation: Dispatch<SetStateAction<string>>;
}) => {
	const connections = constellation.connections;
	const starDataArray = constellation.astronomical_data;
	const name: string = constellation.name;

	const lines = useMemo(() => {
		const result: number[][][] = [];
		connections.forEach((pair) => {
			// pair looks like this: 1-2
			const [lineStart, lineEnd] = pair
				.split("-")
				.map(
					(index) => starDataArray[Number.parseInt(index)].cartesian,
				);
			result.push([lineStart, lineEnd]);
		});
		return result;
	}, [connections, starDataArray]);

	const scale = 1;

	return (
		<>
			{starDataArray.map((star: Star) => (
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
					key={name + lines.indexOf(pair)}
					start={new Vector3(...pair[0].map((x) => x * scale))}
					end={new Vector3(...pair[1].map((x) => x * scale))}
				/>
			))}

			<ConstellationMarker
				key={name}
				name={name}
				starDataArray={starDataArray}
				setSelectedConstellation={setSelectedConstellation}
			/>
		</>
	);
};

export { ConstellationObject };
