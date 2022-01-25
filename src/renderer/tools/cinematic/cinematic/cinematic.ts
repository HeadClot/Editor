import { Animation, AnimationGroup, Scene } from "babylonjs";
import { Nullable } from "../../../../shared/types";

import { ICinematic, ICinematicCamera, ICinematicTrack } from "../types/base";
import { CinematicTrackType } from "../types/track";

export class Cinematic implements ICinematic {
	/**
	 * @hidden
	 */
	public _animationGroup: Nullable<AnimationGroup> = null;

	/**
	 * Plays the cinematic.
	 */
	public play(scene: Scene): void {
		this._animationGroup = this.generateAnimationGroup(scene);
		this._animationGroup.play();
	}

	/**
	 * Stops the cinematic.
	 */
	public stop(): void {
		if (this._animationGroup) {
			this._animationGroup.stop();
			this._animationGroup.dispose();
		}
		
		this._animationGroup = null;
	}

	/**
	 * Generates the animation group and returns its reference.
	 */
	public generateAnimationGroup(scene: Scene): AnimationGroup {
		const group = new AnimationGroup(this.name);

		this._generateTrack(scene, group, this.camera.fov);
		this._generateTrack(scene, group, this.camera.position);
		this._generateTrack(scene, group, this.camera.rotation);

		this.tracks.forEach((t) => this._generateTrack(scene, group, t));

		return group;
	}

	/**
	 * Generates the given track and pushes its animations in the group.
	 */
	private _generateTrack(scene: Scene, group: AnimationGroup, track: ICinematicTrack): void {
		switch (track.type) {
			case CinematicTrackType.Property:
				this._generatePropertyTrack(scene, group, track);
				break;
			case CinematicTrackType.AnimationGroup:
				this._generateAnimationGroupTrack(scene, group, track);
				break;
		}
	}

	/**
	 * Generates the given property track.
	 */
	private _generatePropertyTrack(scene: Scene, group: AnimationGroup, track: ICinematicTrack): void {
		const node = scene.getNodeById(track.property!.nodeId);
		if (!node) {
			return;
		}

		const p = track.property!;

		const animation = new Animation(p.propertyPath, p.propertyPath, this.framesPerSecond, p.animationType, Animation.ANIMATIONLOOPMODE_CYCLE, false);
		animation.setKeys(p.keys);

		group.addTargetedAnimation(animation, node);
	}

	/**
	 * Generates the given animation group track.
	 */
	private _generateAnimationGroupTrack(scene: Scene, group: AnimationGroup, track: ICinematicTrack): void {
		const trackGroup = scene.getAnimationGroupByName(track.animationGroup!.name);
		if (!trackGroup) {
			return;
		}

		track.animationGroup!.slots.forEach((s) => {
			trackGroup.targetedAnimations.forEach((ta) => {
				const a = ta.animation.clone();
				a.framePerSecond = this.framesPerSecond;

				const keys = ta.animation.getKeys();
				const normalizedFps = (this.framesPerSecond / a.framePerSecond);

				a.setKeys(keys.map((k) => {
					const frame = s.position + k.frame * normalizedFps;
					return { ...k, frame };
				}));

				group.addTargetedAnimation(a, ta.target);
			});
		});
	}

	/**
	 * Defines the name of the cinematic.
	 */
	public name: string = "my-cinematic";
	/**
	 * Defines the number of frames computed per second.
	 */
	public framesPerSecond: number = 24;

	/**
	 * Defines the reference to the camera's configuration for the cinematic.
	 */
	public camera: ICinematicCamera = {
		fov: {
			type: CinematicTrackType.Property,
			property: {
				nodeId: "None",
				keys: [],
				propertyPath: "fov",
				animationType: Animation.ANIMATIONTYPE_FLOAT,
			},
		},
		position: {
			type: CinematicTrackType.Property,
			property: {
				keys: [],
				nodeId: "None",
				propertyPath: "position",
				animationType: Animation.ANIMATIONTYPE_VECTOR3,
			},
		},
		rotation: {
			type: CinematicTrackType.Property,
			property: {
				keys: [],
				nodeId: "None",
				propertyPath: "rotation",
				animationType: Animation.ANIMATIONTYPE_VECTOR3,
			},
		},
		cameraId: "None",
	};

	/**
	 * Defines the list of all cinematic tracks.
	 */
	public tracks: ICinematicTrack[] = [{
		type: CinematicTrackType.AnimationGroup,
		animationGroup: {
			name: "idle",
			slots: [
				{ position: 0, start: 0, end: 1.95 },
			],
		},
	}, {
		type: CinematicTrackType.AnimationGroup,
		animationGroup: {
			name: "walking",
			slots: [
				{ position: 0, start: 0, end: 0.95 },
			],
		},
	}];
};
