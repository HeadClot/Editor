import { Nullable } from "../../../../shared/types";

import * as React from "react";
import { Tooltip } from "@blueprintjs/core";

import { AnimationGroup } from "babylonjs";

import { Editor } from "../../../editor/editor";

import { Cinematic } from "../cinematic/cinematic";

export interface ITimeTrackerProps {
	/**
	 * Defines the reference to the editor.
	 */
	editor: Editor;
	/**
	 * Defines the value of the current zoom applied on the timeline.
	 */
	zoom: number;
	/**
	 * Defines the current width of the time measure bar.
	 */
	width: number;
	/**
	 * Defines the reference to the cinematic.
	 */
	cinematc: Cinematic;
}

export interface ITimeTrackerState {
	/**
	 * Defines the value of the current zoom applied on the timeline.
	 */
	zoom: number;
	/**
	 * Defines the current width of the time measure bar.
	 */
	width: number;
	/**
	 * Defines the current position of the time tracker expressed in pixels.
	 */
	position: number;
	/**
	 * Defines the current with of the timelines panel.
	 */
	panelWidth: number;
	/**
	 * Defines the current value of the left scroll for the timeline.
	 */
	scrollLeft: number;
}

export class TimeTracker extends React.Component<ITimeTrackerProps, ITimeTrackerState> {
	private _tracker: Nullable<HTMLDivElement> = null;

	private _mouseUpEventListener: Nullable<(ev: MouseEvent) => void> = null;
	private _mouseMoveEventListener: Nullable<(ev: MouseEvent) => void> = null;

	private _startX: number = 0;
	private _startPosition: number = 0;

	private _moving: boolean = false;

	private _animationGroup: Nullable<AnimationGroup> = null;

	/**
	 * Constructor.
	 * @param props defines the component's props.
	 */
	public constructor(props: ITimeTrackerProps) {
		super(props);

		this.state = {
			...props,
			position: 0,
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

		for (let i = 0; i < step; ++i) {
			const frame = Math.round(i * 60 / zoom);
			children.push(
				<div
					style={{ position: "absolute", width: "2px", height: "100%", backgroundColor: "#353535", left: `${frame * this.state.zoom + 40}px` }}
				/>
			);
		}

		return (
			<div
				style={{ position: "relative", height: "15px" }}
				onClick={(ev) => this._handleTrackBarMouseDown(ev)}
			>
				{children}

				<div
					style={{ position: "absolute", width: "2px", height: "100%", backgroundColor: "#222222", left: `${this.state.position * this.state.zoom + 30}px` }}
				/>

				<Tooltip boundary="scrollParent" content={this.state.position.toString()} position="top">
					<div
						ref={(r) => this._tracker = r}
						onClick={(ev) => ev.stopPropagation()}
						onMouseDown={(ev) => this._handleMouseDown(ev)}
						onMouseEnter={() => this._tracker!.style.backgroundColor = "#111111"}
						onMouseLeave={() => this._tracker!.style.backgroundColor = "#222222"}
						style={{ position: "absolute", width: "30px", height: "15px", backgroundColor: "#222222", marginTop: "-13px", left: `${this.state.position * this.state.zoom + 25}px` }}
					/>
				</Tooltip>
			</div>
		);
	}

	public getPosition(): number {
		return this.state.position;
	}

	/**
	 * Called on the user uses the wheel in the tool to zoom/unzoom.
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
	 * Sets the new panel width of the timelines.
	 * @param panelWidth defines the value of the new panel's width.
	 */
	public setPanelWidth(panelWidth: number): void {
		this.setState({ panelWidth });
	}

	/**
	 * Sets the new scroll value for the timelines div.
	 * @param scrollLeft defines the value of the current scroll of timelines div.
	 */
	public setScroll(scrollLeft: number): void {
		this.setState({ scrollLeft });
	}

	/**
	 * Called on the user clicked on the track bar.
	 */
	private _handleTrackBarMouseDown(ev: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
		if (this._moving) {
			return;
		}

		const position = Math.round((ev.nativeEvent.offsetX - 15) / this.state.zoom);
		
		this.setState({ position });
		this._updateAnimationGroupPosition(position);
	}

	/**
	 * Called on the user clicks on the tracker.
	 */
	private _handleMouseDown(ev: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
		this._moving = true;

		this._startX = ev.clientX;
		this._startPosition = this.state.position;

		document.addEventListener("mouseup", this._mouseUpEventListener = () => {
			this._moving = false;

			document.removeEventListener("mouseup", this._mouseUpEventListener!);
			document.removeEventListener("mousemove", this._mouseMoveEventListener!);

			this._mouseUpEventListener = null;
			this._mouseMoveEventListener = null;
		});

		document.addEventListener("mousemove", this._mouseMoveEventListener = (ev) => {
			const diff = (this._startX - ev.clientX) / this.state.zoom;
			const position = Math.max(0, this._startPosition - diff);

			this.setState({ position });
			this._updateAnimationGroupPosition(position);
		});
	}

	private _updateAnimationGroupPosition(position: number): void {
		if (this._animationGroup) {
			this._animationGroup.stop();
			this._animationGroup.dispose();
		}

		this._animationGroup = this.props.cinematc.generateAnimationGroup(this.props.editor.scene!) ?? null;
		if (this._animationGroup) {
			if (position <= this._animationGroup.to) {
				this._animationGroup.start(false);
				this._animationGroup.goToFrame(position);
				this._animationGroup.pause();
			}
		}
	}
}
