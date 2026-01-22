import "./styles/App.css";
import ConstellationCanvas from "./Components/canvas";
import BurgerMenu from "./Components/burgerMenu";
import { ConstellationInfo } from "./Components/constellationInfo";
import { useState } from "react";
import { SearchBar } from "./Components/search";

const App = () => {
	const [selectedConstellation, setSelectedConstellation] = useState("");
	return (
		<div className="main-content">
			<BurgerMenu />
			<SearchBar />
			<ConstellationInfo
				currentConstellation={selectedConstellation}
				setSelectedConstellation={setSelectedConstellation}
			/>
			<ConstellationCanvas
				setSelectedConstellation={setSelectedConstellation}
			/>
		</div>
	);
};

export default App;
