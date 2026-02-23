import axios from "axios";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { Constellation, Star } from "../types/types";
import {
	distanceToLyFormat,
	formatDistanceInfo,
	sortByName,
} from "../utils/utils";

const embedButtonsToText = (
	text: string,
	setSelectedConstellationName: Dispatch<SetStateAction<string>>,
	setDetailedView: Dispatch<SetStateAction<boolean>>,
) => {
	const matches = [...text.matchAll(/<([^>]+)>/g)];
	const buttonWords = matches.map((match) => match[0]);

	const textParts: string[] = [];
	let currentButtonIndex = 0;

	buttonWords.forEach((word) => {
		textParts.push(
			text.slice(
				currentButtonIndex,
				text.indexOf(word, currentButtonIndex),
			),
		);
		currentButtonIndex =
			text.indexOf(word, currentButtonIndex) + word.length;
	});

	textParts.push(text.slice(currentButtonIndex, text.length));

	const buttonsEmbedded = [];
	const buttonsEmbeddedLength = textParts.length + buttonWords.length;

	for (let i = 0; i < buttonsEmbeddedLength; i++) {
		if (i % 2 == 0) {
			buttonsEmbedded.push(<span>{textParts.shift()}</span>);
		} else {
			const name = buttonWords.shift()?.slice(1, -1);
			if (!name) {
				continue;
			}
			buttonsEmbedded.push(
				<button
					onClick={() => {
						setSelectedConstellationName(name);
						setDetailedView(true);
					}}>
					{name}
				</button>,
			);
		}
	}

	return buttonsEmbedded;
};

const getConstellationInfo = async (constellationName: string) => {
	try {
		const response = await axios.get("/api/constellations/", {
			params: { name: constellationName },
		});
		return response.data;
	} catch (error) {
		console.error("Error fetching data:", error);
	}
};

const ConstellationInfo = ({
	selectedConstellationName,
	setSelectedConstellationName,
	setDetailedView,
	onResetCamera,
	onMoveToConstellation,
}: {
	selectedConstellationName: string;
	setSelectedConstellationName: Dispatch<SetStateAction<string>>;
	setDetailedView: Dispatch<SetStateAction<boolean>>;
	onResetCamera: () => void;
	onMoveToConstellation: (starDataArray: Star[]) => void;
}) => {
	const [constellationData, setConstellationData] = useState<Constellation>();
	const [showInfoBox, setShowInfoBox] = useState(true);

	useEffect(() => {
		if (selectedConstellationName) {
			getConstellationInfo(selectedConstellationName).then(
				(constellation: Constellation) => {
					setConstellationData(constellation);
					onMoveToConstellation(constellation.astronomical_data);
				},
			);
		}
	}, [selectedConstellationName, onMoveToConstellation]);

	if (constellationData?.general_info && selectedConstellationName) {
		const starDataArray: Star[] = constellationData.astronomical_data;

		const [averageDistance, nearestStar, farthestStar] = [
			...formatDistanceInfo(starDataArray),
		];

		return (
			<div
				className={`constellation-info ${showInfoBox ? "large" : "small"}`}>
				<div id="constellation-info__controls">
					<h1 id="constellation-info__name">
						{constellationData.name}
					</h1>
					<button
						onClick={() => onMoveToConstellation(starDataArray)}>
						<i
							className="fa-solid fa-arrows-rotate"
							id="refresh-button"></i>
					</button>

					<button
						onClick={() => {
							setShowInfoBox(true);
							onResetCamera();
							setSelectedConstellationName("");
							setDetailedView(false);
						}}>
						<i
							className="fa-solid fa-earth-europe"
							id="default-button"></i>
					</button>

					<button onClick={() => setShowInfoBox(!showInfoBox)}>
						{showInfoBox ? (
							<i
								className="fa-regular fa-eye-slash"
								id="hide-button"></i>
						) : (
							<i
								className="fa-regular fa-eye"
								id="show-button"></i>
						)}
					</button>
				</div>
				{showInfoBox ? (
					<div id="constellation-info__box">
						<div id="constellation-info__stats">
							<p>
								Average distance:{" "}
								{distanceToLyFormat(averageDistance)}
							</p>
							<p>
								Nearest star: {distanceToLyFormat(nearestStar)}
							</p>
							<p>
								Farthest star:{" "}
								{distanceToLyFormat(farthestStar)}
							</p>
						</div>

						<div id="constellation-info__general">
							{...embedButtonsToText(
								constellationData.general_info,
								setSelectedConstellationName,
								setDetailedView,
							)}
						</div>
						<ul id="constellation-info__box-stars">
							{starDataArray.toSorted(sortByName).map((star) => {
								return (
									<li
										className="constellation-info__star"
										key={star.name}>
										{star.name}{" "}
										{distanceToLyFormat(star.distance)}{" "}
										<span id="constellation-info__star--estimated">
											{star.distance_estimated ? "*" : ""}
										</span>
									</li>
								);
							})}
						</ul>
						<p id="constellation-info__source">
							Sources:{" "}
							<a
								href={`https://en.wikipedia.org/wiki/${selectedConstellationName}_(constellation)`}
								target="_blank">
								Wikipedia
							</a>
							{", "}
							<a
								href="https://stellarium-web.org/"
								target="_blank">
								Stellarium
							</a>
						</p>
					</div>
				) : (
					<div></div>
				)}
			</div>
		);
	} else {
		return <div style={{ all: "unset" }}></div>;
	}
};

export { ConstellationInfo };
