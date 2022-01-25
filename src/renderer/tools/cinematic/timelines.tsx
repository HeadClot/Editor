import { Nullable } from "../../../shared/types";

import * as React from "react";
import { Tree, TreeNodeInfo } from "@blueprintjs/core";

import { Animation, Scalar, Vector3 } from "babylonjs";

import { Editor } from "../../editor/editor";

import { Tools } from "../../editor/tools/tools";

import { Timeline } from "./timelines/timeline";
import { TimeTracker } from "./timelines/time-tracker";
import { TimeMeasure } from "./timelines/time-measure";

import { Cinematic } from "./cinematic/cinematic";

import { ICinematicTrack } from "./types/base";
import { CinematicTrackType } from "./types/track";

export interface ITimelinesProps {
	/**
	 * Defines the reference to the editor.
	 */
	editor: Editor;
	/**
	 * Defines the reference to the cinematic being edited.
	 */
	cinematic: Cinematic;
}

export interface ITimelinesState {
	/**
	 * Defines the value of the current zoom applied on the timeline.
	 */
	zoom: number;
	/**
	 * Defines the current width of the tool.
	 */
	width: number;
	/**
	 * Defines the current with of the timelines panel.
	 */
	panelWidth: number;

	/**
	 * Defines the list of the tracks nodes.
	 */
	nodes: TreeNodeInfo<ICinematicTrack>[];
}

export class Timelines extends React.Component<ITimelinesProps, ITimelinesState> {
	private _timeTracker: Nullable<TimeTracker> = null;
	private _timeMeasure: Nullable<TimeMeasure> = null;

	private _timelines: Timeline[] = [];

	/**
	 * Constructor.
	 * @param props defines the component's props.
	 */
	public constructor(props: ITimelinesProps) {
		super(props);

		this.state = {
			zoom: 1,
			width: 2000,
			panelWidth: 2000,
			nodes: [],
		};
	}

	/**
	 * Renders the component.
	 */
	public render(): React.ReactNode {
		return (
			<div
				onWheel={(ev) => this._onWheel(ev)}
				onScroll={(ev) => this._handleTimelineScroll(ev)}
				style={{ height: "100%", overflow: "auto", backgroundColor: "#3A3A3A" }}
			>
				<div key="mainDiv" style={{ width: `${this.state.width}px`, height: "100%" }}>
					<TimeTracker key="timeTracker" ref={(r) => this._timeTracker = r} editor={this.props.editor} cinematc={this.props.cinematic} zoom={this.state.zoom} width={this.state.width} />

					<div>
						<Tree
							key="tracksTree"
							contents={this.state.nodes}
						/>
					</div>
				</div>
			</div>
		);
	}

	/**
	 * Called on the component did mount.
	 */
	public componentDidMount(): void {
		this.refreshTimelines();
	}

	/**
	 * Sets the new panel width of the timelines.
	 * @param panelWidth defines the value of the new panel's width.
	 */
	public setPanelWidth(panelWidth: number): void {
		this.setState({ panelWidth }, () => {
			this._updateWidth(this.state.zoom);
			this._timeMeasure?.setPanelWidth(panelWidth);
		});
	}

	/**
	 * Refreshes the timelines.
	 */
	public refreshTimelines(): void {
		this._timelines = [];

		this.setState({
			nodes: [...this._getCameraTreeNodeData(), ...this._getContentTreeNodeData()],
		});
	}

	/**
	 * Adds a key frame at the selected frame.
	 */
	public addKeyFrame(trackId?: string): void {
		const frame = this._timeTracker?.state.position ?? null;
		if (frame === null) {
			return;
		}

		if (!trackId || trackId === "cinematic-editor-camera") {
			this._addKeyFrameForTrack(frame, this.props.cinematic.camera.fov);
			this._addKeyFrameForTrack(frame, this.props.cinematic.camera.position);
			this._addKeyFrameForTrack(frame, this.props.cinematic.camera.rotation);
			
			this.props.cinematic.tracks.forEach((t) => this._addKeyFrameForTrack(frame, t));
		} else {
			switch (trackId) {
				case "cinematic-editor-camera-fov":
					this._addKeyFrameForTrack(frame, this.props.cinematic.camera.fov);
					break;
				case "cinematic-editor-camera-position":
					this._addKeyFrameForTrack(frame, this.props.cinematic.camera.position);
					break;
				case "cinematic-editor-camera-rotation":
					this._addKeyFrameForTrack(frame, this.props.cinematic.camera.rotation);
					break;

				default:
					// TODO: find track and add key frame.
					break;
			}
		}

		this.refreshTimelines();
	}

	/**
	 * Adds a key to the given frame for the given track.
	 */
	private _addKeyFrameForTrack(frame: number, track: ICinematicTrack): void {
		if (track.type !== CinematicTrackType.Property) {
			return;
		}

		const object = this.props.editor.scene?.getNodeById(track.property!.nodeId);
		if (!object) {
			return;
		}

		let value: any;

		switch (track.property!.animationType) {
			case Animation.ANIMATIONTYPE_FLOAT: value = Tools.GetProperty<number>(object, track.property!.propertyPath); break;
			case Animation.ANIMATIONTYPE_VECTOR3: value = Tools.GetProperty<Vector3>(object, track.property!.propertyPath)?.clone(); break;
			default: return;
		}

		if ((value ?? null) === null) {
			return;
		}

		track.property!.keys.push({ frame, value });
	}

	/**
	 * Called on the user uses the mouse's wheel.
	 */
	private _onWheel(ev: React.WheelEvent<HTMLDivElement>): void {
		const zoom = Scalar.Clamp(this.state.zoom - ev.deltaY * 0.1, 1, 10);
		this._updateWidth(zoom);

		this._timelines.forEach((t) => t.setZoom(zoom));
	}

	/**
	 * Called on the user scrolls in the timelines div.
	 */
	private _handleTimelineScroll(ev: React.UIEvent<HTMLDivElement>): void {
		this._timeTracker?.setScroll(ev.currentTarget.scrollLeft);
		this._timeMeasure?.setScroll(ev.currentTarget.scrollLeft);
	}

	/**
	 * Updates the width of the panel according to the given zoom.
	 */
	private _updateWidth(zoom: number): void {
		const width = this.state.panelWidth * zoom;

		this._timeTracker?.onZoom(zoom);
		this._timeTracker?.setWidth(width);

		this._timeMeasure?.onZoom(zoom);
		this._timeMeasure?.setWidth(width);

		this.setState({ zoom, width });
	}

	/**
	 * Returns the list of all timeline nodes for the camera.
	 */
	private _getCameraTreeNodeData(): TreeNodeInfo<ICinematicTrack>[] {
		return [{
			disabled: true,
			isSelected: true,
			id: "cinematic-editor-time-measure",
			label: <TimeMeasure ref={(r) => this._timeMeasure = r} />,
		}, {
			id: "cinematic-editor-camera-position",
			label: this._getTimelineForTrack(this.props.cinematic.camera.position),
		}, {
			id: "cinematic-editor-camera-rotation",
			label: this._getTimelineForTrack(this.props.cinematic.camera.rotation),
		}, {
			id: "cinematic-editor-camera-fov",
			label: this._getTimelineForTrack(this.props.cinematic.camera.fov),
		}];
	}

	/**
	 * Returns the list of all timeline nodes created by the user.
	 */
	private _getContentTreeNodeData(): TreeNodeInfo<ICinematicTrack>[] {
		return this.props.cinematic.tracks.map((t, index) => {
			return {
				id: `track${index}`,
				label: this._getTimelineForTrack(t),
			}
		});
	}

	/**
	 * Returns the timeline element for the given track.
	 */
	private _getTimelineForTrack(track: ICinematicTrack): JSX.Element {
		return (
			<Timeline
				track={track}
				editor={this.props.editor}
				cinematic={this.props.cinematic}
				ref={(r) => r && this._timelines.push(r)}
			/>
		);
	}
}
