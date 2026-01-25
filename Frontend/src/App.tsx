import "./styles/App.css";
import ConstellationCanvas from "./Components/canvas";
import BurgerMenu from "./Components/burgerMenu";
import { ConstellationInfo } from "./Components/constellationInfo";
import { useState } from "react";
import { SearchBar } from "./Components/searchBar";

const App = () => {
	const [selectedConstellation, setSelectedConstellation] = useState("");
	return (
		<div className="main-content">
			<div className="top-container">
				<BurgerMenu />
				<SearchBar
					setSelectedConstellation={setSelectedConstellation}
				/>
				<ConstellationInfo
					currentConstellation={selectedConstellation}
					setSelectedConstellation={setSelectedConstellation}
				/>
			</div>
			<ConstellationCanvas
				setSelectedConstellation={setSelectedConstellation}
			/>
		</div>
	);
};

export default App;
