import { useRef, useEffect } from "react";

export function useFirstRenderResetOnCondition(condition: boolean) {
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (condition) {
			isFirstRender.current = true; // Reset when condition turns true
		}
	}, [condition]);

	return isFirstRender;
}
