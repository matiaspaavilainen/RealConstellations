import axios from "axios";
import type { Constellation, Star } from "../types/types";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { sortByName } from "../utils/utils";

const distanceToLyFormat = (distance: number, digits: number = 2) => {
	return (distance * 3.26156).toFixed(digits) + " ly";
};

const formatDistanceInfo = (stars: Star[]) => {
	const averageDistance =
		stars.reduce((sum, star) => sum + star.distance, 0) / stars.length;
	const sortedByDistance = stars.toSorted(
		(a: Star, b: Star) => a.distance - b.distance,
	);

	// stars can't be null when this function is called
	const nearestStar = sortedByDistance.at(0)!.distance;
	const farthestStar = sortedByDistance.at(-1)!.distance;
	return [averageDistance, nearestStar, farthestStar];
};

const embedButtonsToText = (
	text: string,
	setSelectedConstellation: Dispatch<SetStateAction<string>>,
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
				<button onClick={() => setSelectedConstellation(name)}>
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
	currentConstellation,
	setSelectedConstellation,
}: {
	currentConstellation: string;
	setSelectedConstellation: Dispatch<SetStateAction<string>>;
}) => {
	const [constellation, setConstellation] = useState<Constellation>();

	useEffect(() => {
		if (currentConstellation) {
			getConstellationInfo(currentConstellation).then(
				(constellation: Constellation) => {
					setConstellation(constellation);
				},
			);
		}
	}, [currentConstellation]);

	if (constellation?.general_info && currentConstellation) {
		const stars: Star[] = constellation.astronomical_data;

		const [averageDistance, nearestStar, farthestStar] = [
			...formatDistanceInfo(stars),
		];

		return (
			<div id="constellation-info">
				<h1 id="constellation-info__name">{constellation.name}</h1>

				<button
					id="constellation-info__close"
					onClick={() => {
						setSelectedConstellation("");
					}}>
					X
				</button>

				<p>Average distance: {distanceToLyFormat(averageDistance)}</p>
				<p>Nearest star: {distanceToLyFormat(nearestStar)}</p>
				<p>Farthest star: {distanceToLyFormat(farthestStar)}</p>

				<div id="constellation-info__text">
					{...embedButtonsToText(
						constellation.general_info,
						setSelectedConstellation,
					)}
				</div>
				{stars.toSorted(sortByName).map((star) => {
					return (
						<p
							className="constellation-info__star"
							key={star.name}>
							{star.name} {distanceToLyFormat(star.distance)}{" "}
							<span id="constellation-info__star--estimated">
								{star.distance_estimated ? "*" : ""}
							</span>
						</p>
					);
				})}
				<p id="constellation-info__source">
					Sources:{" "}
					<a
						href={`https://en.wikipedia.org/wiki/${currentConstellation}_(constellation)`}
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
		);
	} else {
		return <div style={{ all: "unset" }}></div>;
	}
};

export { ConstellationInfo };
