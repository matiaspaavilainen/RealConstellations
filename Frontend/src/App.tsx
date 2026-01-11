import "./styles/App.css";
import ConstellationCanvas from "./Components/scene/canvas";
import TopBar from "./Components/topBar";

const App = () => {
	return (
		<div className="main-content">
			<TopBar />
			<ConstellationCanvas />
		</div>
	);
};

export default App;
