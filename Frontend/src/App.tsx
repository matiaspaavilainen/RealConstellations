import "./styles/App.css";
import Basic from "./canvas";
import TopBar from "./Components/topBar";

const App = () => {
	return (
		<div className="main-content">
			<TopBar />
			<Basic />
		</div>
	);
};

export default App;
