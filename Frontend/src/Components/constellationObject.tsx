import {
	Billboard,
	CameraControls,
	Line,
	Text,
	type TextProps,
} from "@react-three/drei";

import { Mesh, Vector3 } from "three";
import {
	useMemo,
	useRef,
	useState,
	type Dispatch,
	type SetStateAction,
} from "react";

import {
	calculateCenter,
	calculateProjectedCenter,
	sortByDistance,
} from "../utils/utils";
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
		const distanceToCamera = controls
			?.getPosition(new Vector3())
			?.distanceTo(position);
		if (meshRef.current) {
			const scale = distanceToCamera * baseStarSize;
			meshRef.current.scale.setScalar(scale);
		}

		if (textRef.current) {
			textRef.current.fontSize = distanceToCamera * baseFontSize;
		}
	});

	if (nameVisible) {
		const textPos = new Vector3().copy(position).add(new Vector3(0, 0, 0));

		return (
			<>
				<mesh
					ref={meshRef}
					position={position}
					visible={visible}>
					<sphereGeometry args={[1]} />
					<meshBasicMaterial color={"white"} />
				</mesh>
				<Billboard
					position={textPos}
					visible={nameVisible}>
					<Text
						ref={textRef}
						fontSize={baseFontSize}>
						{name}
					</Text>
				</Billboard>
			</>
		);
	} else {
		return (
			<mesh
				position={position}
				visible={visible}>
				{/* normalized size */}
				<sphereGeometry args={[distance / 300]} />
				<meshBasicMaterial color={"white"} />
			</mesh>
		);
	}
};

const ConnectingLine = ({
	start,
	end,
	visible,
}: {
	start: Vector3;
	end: Vector3;
	visible: boolean;
}) => {
	return (
		<mesh visible={visible}>
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
	visible,
	controls,
	starDataArray,
	setSelectedConstellation,
	setDetailedView,
}: {
	name: string;
	visible: boolean;
	controls: CameraControls;
	starDataArray: Star[];
	setSelectedConstellation: Dispatch<SetStateAction<string>>;
	setDetailedView: Dispatch<SetStateAction<boolean>>;
}) => {
	const [hovered, setHovered] = useState(false);
	// the point where the text should be at
	const projectedCenter: Vector3 = calculateProjectedCenter(starDataArray);

	const handleConstellationClick = () => {
		setSelectedConstellation(name);
		setDetailedView(true);
		// center point of the constellation to orbit around
		const calculatedConstellationCenter: Vector3 =
			calculateCenter(starDataArray);
		// Direction of Earth
		const viewFromEarthVec: Vector3 = new Vector3().copy(
			calculatedConstellationCenter,
		);

		const furthestStarPosition =
			starDataArray.toSorted(sortByDistance)[0].cartesian;

		// set the lenght of the vector to be the same as the furthest star from center
		const lookFromEarth: Vector3 = viewFromEarthVec.setLength(
			calculatedConstellationCenter.distanceTo(
				new Vector3(...furthestStarPosition),
			) / 2,
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

	if (detailedView && selectedConstellationName == name) {
		starNameVisible = true;
	}

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
				/>
			))}

			<ConstellationMarker
				key={name}
				name={name}
				visible={constellationMarkerVisible}
				controls={controls}
				starDataArray={starDataArray}
				setSelectedConstellation={setSelectedConstellationName}
				setDetailedView={setDetailedView}
			/>
		</>
	);
};

export { ConstellationObject };
