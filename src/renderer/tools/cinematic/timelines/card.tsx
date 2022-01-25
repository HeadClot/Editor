import { Nullable } from "../../../../shared/types";

import * as React from "react";
import { ContextMenu, Menu, MenuItem, Tooltip } from "@blueprintjs/core";

import { AnimationGroup } from "babylonjs";

import { Icon } from "../../../editor/gui/icon";

import { Editor } from "../../../editor/editor";

import { Cinematic } from "../cinematic/cinematic";
import { ICinematicAnimationGroupSlot, ICinematicAnimationGroupTrack } from "../types/track";

import { Timeline } from "./timeline";

export interface ICardTransform {
	/**
	 * Defines the position of the card expressed in pixels.
	 */
	position: number;
}

export interface ICardProps extends ICardTransform {
	/**
	 * Defines the reference to the editor.
	 */
	editor: Editor;
	/**
	 * Defines the current zoom applied on the card.
	 */
	zoom: number;
	/**
	 * Defines the reference to the timeline.
	 */
	timeline: Timeline;
	/**
	 * Defines the reference to the cinematic.
	 */
	cinematic: Cinematic;
	/**
	 * Defines the reference to the animation group's track.
	 */
	track: ICinematicAnimationGroupTrack;
	/**
	 * Defines the reference to the animation group's slot.
	 */
	animationGroupSlot: ICinematicAnimationGroupSlot;
}

export interface ICardState extends ICardTransform {
	/**
	 * Defines the current zoom applied on the card.
	 */
	zoom: number;
	/**
	 * Defines the width of the card.
	 */
	width: number;
}

export class Card extends React.Component<ICardProps, ICardState> {
	private _mouseUpEventListener: Nullable<(ev: MouseEvent) => void> = null;
	private _mouseMoveEventListener: Nullable<(ev: MouseEvent) => void> = null;

	private _startX: number = 0;
	private _startPosition: number = 0;

	private _animationGroup: Nullable<AnimationGroup> = null;

	/**
	 * Constructor.
	 * @param props defines the component's props.
	 */
	public constructor(props: ICardProps) {
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
					height: "20px",
					lineHeight: "20px",
					cursor: "ew-resize",
					textAlign: "center",
					borderRadius: "5px",
					position: "absolute",
					backgroundColor: "grey",
					width: `${this.state.width * this.state.zoom}px`,
					marginLeft: `${this.state.position * this.state.zoom}px`,
				}}
			>
				<Tooltip content={this.props.track.name} position="top">
					<p style={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
						{this.props.track.name}
					</p>
				</Tooltip>
			</div>
		);
	}

	/**
	 * Called on the component did mount.
	 */
	public componentDidMount(): void {
		this._animationGroup = this.props.editor.scene?.getAnimationGroupByName(this.props.track.name) ?? null;
		if (!this._animationGroup) {
			return;
		}

		const framesPerSecond = this._animationGroup.targetedAnimations[0]?.animation?.framePerSecond ?? null;
		if (framesPerSecond === null) {
			return;
		}

		const framesCount = this._animationGroup.to - this._animationGroup.from;
		this.setState({ width: framesCount * (this.props.cinematic.framesPerSecond / framesPerSecond) });
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

			this.props.animationGroupSlot.position = position;

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
					const index = this.props.track.slots.indexOf(this.props.animationGroupSlot);
					if (index !== -1) {
						this.props.track.slots.splice(index, 1);
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
