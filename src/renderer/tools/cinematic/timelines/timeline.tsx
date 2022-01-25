import * as React from "react";
import { ContextMenu, Menu, MenuItem } from "@blueprintjs/core";

import { Icon } from "../../../editor/gui/icon";

import { Editor } from "../../../editor/editor";

import { Cinematic } from "../cinematic/cinematic";

import { ICinematicTrack } from "../types/base";
import { CinematicTrackType, ICinematicAnimationGroupTrack, ICinematicPropertyTrack } from "../types/track";

import { Key } from "./key";
import { Card } from "./card";

export interface ITimelineProps {
	/**
	 * Defines the reference to the editor.
	 */
	editor: Editor;
	/**
	 * Defines the reference to the cinematic.
	 */
	cinematic: Cinematic;
	/**
	 * Defines the reference to the edited track.
	 */
	track: ICinematicTrack;
}

export interface ITimelineState {
	/**
	 * Defines the current zoom applied on the card.
	 */
	zoom: number;
}

export class Timeline extends React.Component<ITimelineProps, ITimelineState> {
	private _keys: Key[] = [];
	private _cards: Card[] = [];

	/**
	 * Constructor.
	 * @param props defines the component's props.
	 */
	public constructor(props: ITimelineProps) {
		super(props);

		this.state = {
			zoom: 1,
		};
	}

	/**
	 * Renders the component.
	 */
	public render(): React.ReactNode {
		return (
			<div
				style={{ height: "20px" }}
				onContextMenu={(e) => this._handleTimelineContextMenu(e)}
			>
				{this._getChildren()}
			</div>
		);
	}

	/**
	 * Sets the new value of the zoom applied on the timelines.
	 * @param zoom defines the new value of the zoom.
	 */
	public setZoom(zoom: number): void {
		this.setState({ zoom });

		this._keys.forEach((k) => k.setZoom(zoom));
		this._cards.forEach((c) => c.setZoom(zoom));
	}

	/**
	 * Returns the list of children for the timeline (cards, keyframes, etc.)
	 */
	private _getChildren(): React.ReactNode[] {
		switch (this.props.track.type) {
			case CinematicTrackType.Property:
				return this._getPropertyKeys(this.props.track.property!);
			case CinematicTrackType.AnimationGroup:
				return this._getAnimationGroupCards(this.props.track.animationGroup!);
		}
	}

	/**
	 * Returns the list of all HTML elements representing keyframes.
	 */
	private _getPropertyKeys(property: ICinematicPropertyTrack): React.ReactNode[] {
		return property.keys.map((k) => (
			<Key
				ref={(r) => r && this._keys.push(r)}
				timeline={this}
				track={property}
				animationKey={k}
				position={k.frame}
				zoom={this.state.zoom}
			/>
		));
	}

	/**
	 * Returns the list of all HTML elements representing animation groups cards.
	 */
	private _getAnimationGroupCards(animationGroup: ICinematicAnimationGroupTrack): React.ReactNode[] {
		return animationGroup.slots.map((s) => (
			<Card
				timeline={this}
				position={s.position}
				zoom={this.state.zoom}
				track={animationGroup}
				editor={this.props.editor}
				ref={(r) => r && this._cards.push(r)}
				animationGroupSlot={s} cinematic={this.props.cinematic}
			/>
		));
	}

	/**
	 * Called on the user right-clicks on the timeline.
	 */
	private _handleTimelineContextMenu(ev: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
		if (this.props.track.type !== CinematicTrackType.AnimationGroup) {
			return;
		}

		const position = ev.nativeEvent.offsetX / this.state.zoom;

		ContextMenu.show((
			<Menu>
				<MenuItem text="Add Slot" icon={<Icon src="plus.svg" />} onClick={() => this._handleAddSlot(position)} />
			</Menu>
		), {
			top: ev.clientY,
			left: ev.clientX,
		});
	}

	/**
	 * Called on the user wants to add a new slot.
	 */
	private _handleAddSlot(position: number): void {
		const group = this.props.editor.scene!.getAnimationGroupByName(this.props.track.animationGroup!.name);
		if (!group) {
			return;
		}

		this.props.track.animationGroup!.slots.push({
			position,
			end: group.to,
			start: group.from,
		});
		this.forceUpdate();
	}
}
