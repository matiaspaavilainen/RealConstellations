import {
	useMemo,
	useRef,
	useState,
	type BaseSyntheticEvent,
	type Dispatch,
	type SetStateAction,
} from "react";
import type { Constellation } from "../types/types";
import { AnimatePresence, motion } from "motion/react";

const SearchResult = ({
	searchResult,
	handleClick,
}: {
	searchResult: string[] | undefined;
	handleClick: (event: BaseSyntheticEvent) => void;
}) => {
	return searchResult?.map((result) => (
		<button
			className="search-bar__result"
			key={result}
			onClick={handleClick}>
			{result}
		</button>
	));
};

const SearchBar = ({
	setSelectedConstellationName,
	setDetailedView,
	constellationsArray,
}: {
	setSelectedConstellationName: Dispatch<SetStateAction<string>>;
	setDetailedView: Dispatch<SetStateAction<boolean>>;
	constellationsArray: Constellation[];
}) => {
	const constellationNames = useMemo(() => {
		return constellationsArray.map((constellation) => constellation.name);
	}, [constellationsArray]);

	const [searchResult, setSearchResult] = useState<string[]>();
	const [searchQuery, setSearchQuery] = useState("");
	const [expanded, setExpanded] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);

	const onSelection = (name: string) => {
		setSelectedConstellationName(name);
		setDetailedView(true);
		setSearchQuery("");
		setSearchResult([]);
		setExpanded(false);
	};

	const search = () => {
		if (searchResult) {
			onSelection(searchResult[0]);
		}
	};

	const handleOnChange = (event: BaseSyntheticEvent) => {
		const query = event.target.value;

		setSearchQuery(query);
		const result = constellationNames.filter((constellation) => {
			return constellation.toLowerCase().startsWith(query.toLowerCase());
		});

		if (query.length > 0 || result.length < 5) {
			setSearchResult(result);
			return;
		}

		setSearchResult([]);
	};

	const handleClick = (event: BaseSyntheticEvent) => {
		onSelection(event.target.textContent);
	};

	return (
		<div
			id="search-bar"
			onMouseEnter={() => {
				setExpanded(true);
			}}
			onMouseLeave={() => {
				if (
					!searchQuery &&
					document.activeElement !== inputRef.current
				) {
					setExpanded(false);
				}
			}}
			style={{ gridTemplateAreas: "search-bar" }}>
			<i className="fa-solid fa-magnifying-glass"></i>
			<AnimatePresence>
				{expanded && (
					<motion.div
						key="search-expanded"
						initial={{ width: 0, opacity: 0 }}
						animate={{ width: "auto", opacity: 1 }}
						exit={{ width: 0, opacity: 0 }}
						transition={{
							type: "tween",
							duration: 0.4,
							ease: "easeInOut",
						}}
						style={{ overflow: "hidden" }}>
						<form
							id="search-bar__form"
							action={search}
							autoComplete="off">
							<input
								ref={inputRef}
								id="search-bar__form-input"
								placeholder="Search"
								value={searchQuery}
								onChange={handleOnChange}
							/>
						</form>
						<div id="search-bar__results">
							<SearchResult
								handleClick={handleClick}
								searchResult={searchResult}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export { SearchBar };
