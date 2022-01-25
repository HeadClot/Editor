import { Nullable } from "../../../shared/types";

import * as React from "react";
import SplitPane from "react-split-pane";
import { Button, ButtonGroup, Classes, Icon as BPIcon } from "@blueprintjs/core";

import { Icon } from "../../editor/gui/icon";

import { AbstractEditorPlugin, IEditorPluginProps } from "../../editor/tools/plugin";

import { Tracks } from "./tracks";
import { Timelines } from "./timelines";

import { Cinematic } from "./cinematic/cinematic";

export const title = "Cinematic Editor";

export interface ICinematicEditorPluginState {
	isReady: boolean;
	/**
	 * Defines the current with of the timelines panel.
	 */
	panelWidth: number;
	/**
	 * Defines wether or not the timeline is being played.
	 */
	isPlaying: boolean;
}

export default class CinematicEditorPlugin extends AbstractEditorPlugin<ICinematicEditorPluginState> {
	private _tracks: Nullable<Tracks> = null;
	private _timelines: Nullable<Timelines> = null;

	private _cinematic: Nullable<Cinematic> = new Cinematic();

	/**
	 * Constructor.
	 * @param props defines the component's props.
	 */
	public constructor(props: IEditorPluginProps) {
		super(props);

		this.state = {
			panelWidth: 200,
			isPlaying: false,
			isReady: props.editor.isProjectReady,
		};
	}

	/**
	 * Renders the component.
	 */
	public render(): React.ReactNode {
		if (!this.state.isReady) {
			return <div></div>;
		}

		return (
			<div style={{ width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#3A3A3A" }}>
				<div className={Classes.FILL} style={{ width: "100%", height: "25px", backgroundColor: "#333333", borderRadius: "10px", marginTop: "5px" }}>
					<ButtonGroup>
						<Button small text="Prevous" icon={<BPIcon icon="arrow-left" color="white" />} />
					</ButtonGroup>
					<ButtonGroup style={{ position: "absolute", left: "50%", transform: "translate(-50%)" }}>
						<Button small icon={<Icon src="play.svg" />} text="Play" disabled={this.state.isPlaying} onClick={() => this._handlePlay()} />
						<Button small icon={<Icon src="stop.svg" />} text="Stop" disabled={!this.state.isPlaying} onClick={() => this._handleStop()} />
					</ButtonGroup>
					<ButtonGroup style={{ position: "absolute", right: "0px" }}>
						<Button small icon={<Icon src="plus.svg" />} text="Add Key Frame" onClick={() => this._timelines?.addKeyFrame(this._tracks?.state.selectedNode?.id as string)} />
					</ButtonGroup>
				</div>
				{this._getCinematicEditor()}
			</div>
		);
	}

	/**
	 * Called on the plugin is ready.
	 */
	public onReady(): void {
		// Size
		const size = this.editor.getPanelSize(title);
		if (size) {
			this.setState({ panelWidth: size.width - 200 });
		}

		if (!this.state.isReady) {
			this.props.editor.editorInitializedObservable.addOnce(() => this.setState({ isReady: true }));
		}
	}

	/**
	 * Called on the plugin is closed.
	 */
	public onClose(): void {
		// Nothing to do for now...
	}

	/**
	 * Called on the user wants to play the cinematic.
	 */
	private _handlePlay(): void {
		this.setState({ isPlaying: true });
		this._cinematic?.play(this.editor.scene!);
	}

	/**
	 * Called on the user wants to stop the cinematic.
	 */
	private _handleStop(): void {
		this.setState({ isPlaying: false });
		this._cinematic?.stop();
	}

	/**
	 * Called on the panel's width changed.
	 */
	private _handleWidthChanged(panelWidth: number): void {
		this.setState({ panelWidth });
		this._timelines?.setPanelWidth(panelWidth);
	}

	private _getCinematicEditor(): React.ReactNode {
		if (!this._cinematic) {
			return undefined;
		}

		return (
			<SplitPane
				size="75%"
				split="vertical"
				minSize={200}
				primary="second"
				style={{ height: "calc(100% - 30px)" }}
				onChange={(panelWidth) => this._handleWidthChanged(panelWidth)}
			>
				<Tracks ref={(r) => this._tracks = r} editor={this.editor} cinematic={this._cinematic} />
				<Timelines ref={(r) => this._timelines = r} editor={this.editor} cinematic={this._cinematic} />
			</SplitPane>
		);
	}
}
