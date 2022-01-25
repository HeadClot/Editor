import * as React from "react";

export interface ITimeMeasureProps {

}

export interface ITimeMeasureState {
	/**
	 * Defines the value of the current zoom applied on the timeline.
	 */
	zoom: number;
	/**
	 * Defines the current width of the time measure bar.
	 */
	width: number;
	/**
	 * Defines the current with of the timelines panel.
	 */
	panelWidth: number;
	/**
	 * Defines the current value of the left scroll for the timeline.
	 */
	scrollLeft: number;
}

export class TimeMeasure extends React.Component<ITimeMeasureProps, ITimeMeasureState> {
	/**
	 * Constructor.
	 * @param props defines the component's props.
	 */
	public constructor(props: ITimeMeasureProps) {
		super(props);

		this.state = {
			zoom: 1,
			width: 2000,
			scrollLeft: 0,
			panelWidth: 2000,
		};
	}

	/**
	 * Renders the component.
	 */
	public render(): React.ReactNode {
		const children: React.ReactNode[] = [];

		const step = (2 * this.state.width) / 50;
		const zoom = Math.floor(this.state.zoom);

		const minPosition = this.state.scrollLeft - 40;
		const maxPosition = this.state.panelWidth + this.state.scrollLeft;

		for (let i = 0; i < step; ++i) {
			const frame = Math.round(i * 60 / zoom);
			const position = frame * this.state.zoom;

			if (position < minPosition || position > maxPosition) {
				continue;
			}

			children.push(
				<span key={frame} style={{ position: "absolute", transform: "translate(-50%)", left: `${position}px` }}>{frame}</span>
			);
		}

		return (
			<div style={{ width: "100%", height: "30px", lineHeight: "30px" }}>
				{children}
			</div>
		);
	}

	/**
	 * Called on the user uses the wheel in the tool to zoom/unzoom.
	 * @param zoom defines the current zoom factor.
	 */
	public onZoom(zoom: number): void {
		this.setState({ zoom });
	}

	/**
	 * Sets the new width of the timeline.
	 * @param width defines the new with of the timeline.
	 */
	public setWidth(width: number): void {
		this.setState({ width });
	}

	/**
	 * Sets the new scroll value for the timelines div.
	 * @param scrollLeft defines the value of the current scroll of timelines div.
	 */
	public setScroll(scrollLeft: number): void {
		this.setState({ scrollLeft });
	}

	/**
	 * Sets the new panel width of the timelines.
	 * @param panelWidth defines the value of the new panel's width.
	 */
	public setPanelWidth(panelWidth: number): void {
		this.setState({ panelWidth });
	}
}
