import { Billboard, CameraControls, Line, Text } from "@react-three/drei";

import { Mesh, Vector3 } from "three";
import {
	useMemo,
	useRef,
	useState,
	type Dispatch,
	type SetStateAction,
} from "react";

import { calculateProjectedCenter } from "../utils/utils";
import { type Constellation, type Star } from "../types/types";
import { useFrame, useThree } from "@react-three/fiber";

const StarObject = ({
	name,
	position,
	visible,
	nameVisible,
	controls,
}: {
	name: string;
	position: Vector3;
	visible: boolean;
	nameVisible: boolean;
	controls: CameraControls;
}) => {
	const distance = new Vector3(0, 0, 0).distanceTo(position);
	const meshRef = useRef<Mesh>(null);
	const textRef = useRef<any>(null);

	const baseStarSize = 0.005;
	const baseFontSize = 0.015;

	useFrame(() => {
		if (!meshRef.current) return;

		if (nameVisible) {
			const distanceToCamera = controls
				?.getPosition(new Vector3())
				?.distanceTo(position);
			const scale = distanceToCamera * baseStarSize;
			meshRef.current.scale.setScalar(scale);
			textRef.current.fontSize = distanceToCamera * baseFontSize;
		} else {
			// Reset to default size when not in detailed view
			meshRef.current.scale.setScalar(1);
		}
	});

	const textPos = new Vector3().copy(position).addScalar(0);

	return (
		<>
			<mesh
				ref={meshRef}
				position={position}
				visible={visible}>
				<sphereGeometry args={[nameVisible ? 1 : distance / 300]} />
				<meshBasicMaterial color={"white"} />
			</mesh>
			{nameVisible && (
				<Billboard
					position={textPos}
					visible={nameVisible}>
					<Text
						ref={textRef}
						fontSize={baseFontSize}>
						{name}
					</Text>
				</Billboard>
			)}
		</>
	);
};

const ConnectingLine = ({
	start,
	end,
	visible,
	hovered,
}: {
	start: Vector3;
	end: Vector3;
	visible: boolean;
	hovered: boolean;
}) => {
	return (
		<mesh visible={visible}>
			<Line
				points={[start, end]}
				lineWidth={hovered ? 2 : 1}
			/>
			<lineBasicMaterial color={"white"} />
		</mesh>
	);
};

const ConstellationMarker = ({
	name,
	visible,
	starDataArray,
	hovered,
	setHovered,
	setSelectedConstellation,
	setDetailedView,
}: {
	name: string;
	visible: boolean;
	starDataArray: Star[];
	hovered: boolean;
	setHovered: Dispatch<SetStateAction<boolean>>;
	setSelectedConstellation: Dispatch<SetStateAction<string>>;
	setDetailedView: Dispatch<SetStateAction<boolean>>;
}) => {
	// the point where the text should be at
	const projectedCenter: Vector3 = calculateProjectedCenter(starDataArray);

	const handleConstellationClick = () => {
		setSelectedConstellation(name);
		setDetailedView(true);
	};

	return (
		<Billboard
			visible={visible}
			name={name}
			position={projectedCenter}
			onPointerEnter={() => {
				setHovered(true);
			}}
			onPointerLeave={() => {
				setHovered(false);
			}}>
			<Text
				fontSize={0.018}
				outlineWidth={hovered ? "20%" : "0%"}
				outlineColor={"white"}
				outlineBlur={hovered ? "50%" : "0%"}
				outlineOpacity={hovered ? 0.8 : 0}
				color={hovered ? "black" : "white"}
				onClick={handleConstellationClick}>
				{name}
			</Text>
		</Billboard>
	);
};

const ConstellationObject = ({
	constellation,
	selectedConstellationName,
	setSelectedConstellationName,
	detailedView,
	setDetailedView,
}: {
	constellation: Constellation;
	selectedConstellationName: string;
	setSelectedConstellationName: Dispatch<SetStateAction<string>>;
	detailedView: boolean;
	setDetailedView: Dispatch<SetStateAction<boolean>>;
}) => {
	const connections = constellation.connections;
	const starDataArray = constellation.astronomical_data;
	const name = constellation.name;

	const [hovered, setHovered] = useState(false);

	const {
		controls,
	}: {
		controls: CameraControls;
	} = useThree();

	const lines = useMemo(() => {
		const result: number[][][] = [];
		connections.forEach((pair) => {
			// each pair looks like this: 1-2, where they are indexes of the star array
			const [lineStart, lineEnd] = pair
				.split("-")
				.map(
					(index) => starDataArray[Number.parseInt(index)].cartesian,
				);
			result.push([lineStart, lineEnd]);
		});
		return result;
	}, [connections, starDataArray]);

	let objectVisible = true;
	let starNameVisible = false;
	let constellationMarkerVisible = true;

	// show only the objects that are in the selected constellation
	if (detailedView && selectedConstellationName != name) {
		objectVisible = false;
	}

	// show star names when in detailed view
	if (detailedView && selectedConstellationName == name) {
		starNameVisible = true;
	}

	// hide the constellation name
	if (detailedView) {
		constellationMarkerVisible = false;
	}

	return (
		<>
			{starDataArray.map((star: Star) => (
				<StarObject
					key={star.name}
					name={star.name}
					position={new Vector3(...star.cartesian)}
					visible={objectVisible}
					nameVisible={starNameVisible}
					controls={controls}
				/>
			))}
			{lines.map((pair) => (
				<ConnectingLine
					key={name + lines.indexOf(pair)}
					start={new Vector3(...pair[0])}
					end={new Vector3(...pair[1])}
					visible={objectVisible}
					hovered={hovered}
				/>
			))}

			<ConstellationMarker
				key={name}
				name={name}
				visible={constellationMarkerVisible}
				starDataArray={starDataArray}
				hovered={hovered}
				setHovered={setHovered}
				setSelectedConstellation={setSelectedConstellationName}
				setDetailedView={setDetailedView}
			/>
		</>
	);
};

export { ConstellationObject };
