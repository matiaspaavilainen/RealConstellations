import "./styles/App.css";
import axios from "axios";
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { PerspectiveCamera as PerspectiveCameraType, Vector3 } from "three";
import { CameraControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";

import { SearchBar } from "./Components/searchBar";
import { BurgerMenu } from "./Components/burgerMenu";
import { ConstellationInfo } from "./Components/constellationInfo";
import { ConstellationObject } from "./Components/constellationObject";
import type { CameraControlsHandle, Constellation } from "./types/types";

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
			}),
			[controls],
		);

		return null;
	},
);

const App = () => {
	const [selectedConstellationName, setSelectedConstellationName] =
		useState("");

	const [constellationsArray, setConstellationsArray] = useState(
		Array<Constellation>,
	);

	const [mycam, setMyCam] = useState<PerspectiveCameraType | null>(null);

	const [detailedView, setDetailedView] = useState(false);

	const cameraControlsRef = useRef<CameraControlsHandle>(null);

	const handleResetCamera = () => {
		cameraControlsRef.current?.resetToDefault();
	};

	useEffect(() => {
		getConstellations().then((constellations) => {
			if (Array.isArray(constellations)) {
				setConstellationsArray(constellations);
			}
		});
	}, []);

	//distance to sun - sun diameter = approx distance to solar system barycenter in pc = Earth location
	const approxEarthLocation = new Vector3(0.000004861 - 0.000000045, 0, 0);

	//rotate around object vs. scroll the sky
	const rotateSpeed = selectedConstellationName ? 0.5 : -0.2;

	return (
		<div className="main-content">
			<div className="top-container">
				<BurgerMenu />
				<SearchBar />
				<ConstellationInfo
					selectedConstellationName={selectedConstellationName}
					setSelectedConstellationName={setSelectedConstellationName}
					setDetailedView={setDetailedView}
					onResetCamera={handleResetCamera}
				/>
			</div>
			<Canvas
				id="canvas"
				frameloop="demand">
				{constellationsArray.map((constellation) => (
					<ConstellationObject
						key={constellation.name}
						constellation={constellation}
						selectedConstellationName={selectedConstellationName}
						setSelectedConstellationName={
							setSelectedConstellationName
						}
						detailedView={detailedView}
						setDetailedView={setDetailedView}
					/>
				))}

				<CameraControlsExposer ref={cameraControlsRef} />

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
						azimuthRotateSpeed={rotateSpeed}
						polarRotateSpeed={rotateSpeed}
						dolly={false}
						setOrbitPoint={approxEarthLocation}
					/>
				)}
			</Canvas>
		</div>
	);
};

export default App;
