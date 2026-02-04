import { type Dispatch, type SetStateAction } from "react";
import type { Constellation } from "../types/types";

const SearchBar = ({
	constellationsArray,
	setSelectedConstellationName,
}: {
	constellationsArray: Constellation[];
	setSelectedConstellationName: Dispatch<SetStateAction<string>>;
}) => {
	return (
		<form
			style={{ gridTemplateAreas: "search-bar" }}
			id="search-bar__form">
			<input
				id="search-bar__form-input"
				placeholder="Search"></input>
			{/* <button id="search-bar__form-button">P</button> */}
		</form>
	);
};

export { SearchBar };
