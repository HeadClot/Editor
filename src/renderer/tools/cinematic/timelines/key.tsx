import { Nullable } from "../../../../shared/types";

import * as React from "react";
import { ContextMenu, Menu, MenuItem, Tooltip } from "@blueprintjs/core";

import { IAnimationKey } from "babylonjs";

import { Icon } from "../../../editor/gui/icon";

import { Timeline } from "./timeline";
import { ICinematicPropertyTrack } from "../types/track";

export interface IKeyTransform {
	/**
	 * Defines the position of the card expressed in pixels.
	 */
	position: number;
}

export interface IKeyProps extends IKeyTransform {
	/**
	 * Defines the current zoom applied on the card.
	 */
	zoom: number;
	/**
	 * Defines the reference to the timeline.
	 */
	timeline: Timeline;
	/**
	 * Defines the reference to the animation group's track.
	 */
	track: ICinematicPropertyTrack;
	/**
	 * Defines the reference to the animation key.
	 */
	animationKey: IAnimationKey;
}

export interface IKeyState extends IKeyTransform {
	/**
	 * Defines the current zoom applied on the card.
	 */
	zoom: number;
	/**
	 * Defines the width of the card.
	 */
	width: number;
}

export class Key extends React.Component<IKeyProps, IKeyState> {
	private _mouseUpEventListener: Nullable<(ev: MouseEvent) => void> = null;
	private _mouseMoveEventListener: Nullable<(ev: MouseEvent) => void> = null;

	private _startX: number = 0;
	private _startPosition: number = 0;

	/**
	 * Constructor.
	 * @param props defines the component's props.
	 */
	public constructor(props: IKeyProps) {
		super(props);

		this.state = {
			...props,
			width: 95,
		};
	}

	/**
	 * Renders the component.
	 */
	public render(): React.ReactNode {
		return (
			<div
				onMouseDown={(ev) => this._handleMouseDown(ev)}
				onContextMenu={(ev) => this._handleContextMenu(ev)}
				style={{
					width: "20px",
					height: "20px",
					cursor: "ew-resize",
					position: "absolute",
					backgroundColor: "grey",
					transformOrigin: "top left",
					transform: "rotateZ(45deg) scale(0.7)",
					marginLeft: `${this.state.position * this.state.zoom}px`,
				}}
			>
				<Tooltip boundary="scrollParent" content={this.state.position.toString()} position="top">
					<div style={{ width: "20px", height: "20px" }} />
				</Tooltip>
			</div>
		);
	}

	/**
	 * Sets the new value of the zoom applied on the timelines.
	 * @param zoom defines the new value of the zoom.
	 */
	public setZoom(zoom: number): void {
		this.setState({ zoom });
	}

	/**
	 * Called on the user clicks on the tracker.
	 */
	private _handleMouseDown(ev: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
		this._startX = ev.clientX;
		this._startPosition = this.state.position;

		document.addEventListener("mouseup", this._mouseUpEventListener = () => {
			document.removeEventListener("mouseup", this._mouseUpEventListener!);
			document.removeEventListener("mousemove", this._mouseMoveEventListener!);

			this._mouseUpEventListener = null;
			this._mouseMoveEventListener = null;
		});

		document.addEventListener("mousemove", this._mouseMoveEventListener = (ev) => {
			const diff = (this._startX - ev.clientX) / this.state.zoom;
			const position = Math.round(Math.max(0, this._startPosition - diff));

			this.props.animationKey.frame = position;

			this.setState({ position });
		});
	}

	/**
	 * Called on the user right-clicks on the card.
	 */
	private _handleContextMenu(ev: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
		ev.stopPropagation();

		ContextMenu.show((
			<Menu>
				<MenuItem text="Remove" icon={<Icon src="times.svg" />} onClick={() => {
					const index = this.props.track.keys.indexOf(this.props.animationKey);
					if (index !== -1) {
						this.props.track.keys.splice(index, 1);
					}

					this.props.timeline.forceUpdate();
				}} />
			</Menu>
		), {
			top: ev.clientY,
			left: ev.clientX,
		});
	}
}
