import { Nullable } from "../../../shared/types";

import * as React from "react";
import { Button, Tree, TreeNodeInfo } from "@blueprintjs/core";

import { InspectorList } from "../../editor/gui/inspector/fields/list";

import { Editor } from "../../editor/editor";

import { Cinematic } from "./cinematic/cinematic";

import { ICinematicTrack } from "./types/base";
import { CinematicTrackType } from "./types/track";

export interface ITracksProps {
	/**
	 * Defines the reference to the editor.
	 */
	editor: Editor;
	/**
	 * Defines the reference to the cinematic being edited.
	 */
	cinematic: Cinematic;
}

export interface ITracksState {
	/**
	 * Defines the list of all nodes available in the tracks tree.
	 */
	nodes: TreeNodeInfo<ICinematicTrack>[];
	/**
	 * Defines the reference to the selected node in the tracks tree.
	 */
	selectedNode: Nullable<TreeNodeInfo>;
}

export class Tracks extends React.Component<ITracksProps, ITracksState> {
	/**
	 * Constructor.
	 * @param props defines the component's props.
	 */
	public constructor(props: ITracksProps) {
		super(props);

		this.state = {
			selectedNode: null,
			nodes: [this._getCameraContent(), ...this._getTracksContent(), this._getAddButton()],
		};
	}

	/**
	 * Renders the component.
	 */
	public render(): React.ReactNode {
		return (
			<div style={{ height: "100%", marginTop: "15px", backgroundColor: "#3A3A3A" }}>
				<div style={{ width: "100%" }}>
					<Tree
						contents={this.state.nodes}
						onNodeClick={(n) => this._handleNodeClicked(n)}
						onNodeExpand={(n) => this._handleNodeExpand(n)}
						onNodeCollapse={(n) => this._handleNodeCollapsed(n)}
					/>
				</div>
			</div>
		);
	}

	/**
	 * Traverses all the given nodes array and calls the given callback.
	 */
	private _traverseNodes(nodes: TreeNodeInfo[], callback: (n: TreeNodeInfo) => void): void {
		nodes.forEach((n) => {
			callback(n);

			if (n.childNodes?.length) {
				this._traverseNodes(n.childNodes, callback);
			}
		});
	}

	/**
	 * Called on the user expands the given node.
	 */
	private _handleNodeExpand(node: TreeNodeInfo): void {
		node.isExpanded = true;
		this.setState({ nodes: this.state.nodes });
	}

	/**
	 * Called on the user collapses the given node.
	 */
	private _handleNodeCollapsed(node: TreeNodeInfo): void {
		node.isExpanded = false;
		this.setState({ nodes: this.state.nodes });
	}

	/**
	 * Called on the user clicls on the given node.
	 */
	private _handleNodeClicked(node: TreeNodeInfo): void {
		this._traverseNodes(this.state.nodes, (n) => n.isSelected = false);
		node.isSelected = true;

		this.setState({ nodes: this.state.nodes, selectedNode: node });
	}

	/**
	 * Returns all the nodes available for the camera (position, rotation, etc.)
	 */
	private _getCameraContent(): TreeNodeInfo<ICinematicTrack> {
		return {
			hasCaret: true,
			isExpanded: true,
			label: (
				<InspectorList object={{ name: "Camera" }} property="name" label="Camera" noUndoRedo items={() => {
					return this.props.editor.scene?.cameras.map((c) => ({ data: c, label: c.name })) ?? [];
				}} onChange={(c) => {
					const nodeId = c?.id ?? "None";
					this.props.cinematic.camera.cameraId = nodeId;
					this.props.cinematic.camera.fov.property!.nodeId = nodeId;
					this.props.cinematic.camera.position.property!.nodeId = nodeId;
					this.props.cinematic.camera.rotation.property!.nodeId = nodeId;
				}} />
			),
			id: "cinematic-editor-camera",
			childNodes: [{
				label: "Position",
				id: "cinematic-editor-camera-position",
				secondaryLabel: <span style={{ color: "grey" }}>(Vector3)</span>,
			}, {
				label: "Rotation",
				id: "cinematic-editor-camera-rotation",
				secondaryLabel: <span style={{ color: "grey" }}>(Vector3)</span>,
			}, {
				label: "FOV",
				id: "cinematic-editor-camera-fov",
				secondaryLabel: <span style={{ color: "grey" }}>(Number)</span>,
			}],
		};
	}

	/**
	 * Returns the list of additional tracks added by the user.
	 */
	private _getTracksContent(): TreeNodeInfo<ICinematicTrack>[] {
		return this.props.cinematic.tracks.map((t, index) => {
			let label = t.type.toString();
			switch (t.type) {
				case CinematicTrackType.Property: label = t.property!.propertyPath; break;
				case CinematicTrackType.AnimationGroup: label = t.animationGroup!.name; break;
			}

			return {
				label,
				id: `track${index}`,
				secondaryLabel: <span style={{ color: "grey" }}>({t.type.toString()})</span>,
			};
		});
	}

	/**
	 * Returns the button tree node used in the tracks tree to add a custom track.
	 */
	private _getAddButton(): TreeNodeInfo<ICinematicTrack> {
		return {
			id: "cinematic-editor-add-track-button",
			label: <Button small fill>Add...</Button>,
		};
	}
}
