import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const HelpButton = () => {
	const [helpOpen, setHelpOpen] = useState(false);
	return (
		<div id="help-center">
			<button
				id="help-center__button"
				onClick={() => setHelpOpen(!helpOpen)}>
				<i
					className="fa-brands fa-readme"
					id="help-center__button-icon"></i>
			</button>
			<AnimatePresence>
				{helpOpen && (
					<motion.div
						key="help-center-instructions"
						id="help-center__instructions"
						initial={{ width: 0, height: 0, opacity: 0 }}
						animate={{ width: "20em", height: "auto", opacity: 1 }}
						exit={{ width: 0, height: 0, opacity: 0 }}
						transition={{
							type: "tween",
							duration: 0.4,
							ease: "easeInOut",
						}}
						style={{ overflow: "hidden" }}>
						<div id="help-center__instructions-content">
							<h3>Instructions</h3>
							<p>Left Click</p>
							<ul>
								<li>Hold and move to pan the view</li>
								<li>
									Click constellation name to enter detailed
									view
								</li>
							</ul>
							<p>Scroll</p>
							<ul>
								<li>Detailed view: Zoom</li>
							</ul>
							<p>Right Click</p>
							<ul>
								<li>
									Detailed view: Move the center of rotation
								</li>
							</ul>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export { HelpButton };
