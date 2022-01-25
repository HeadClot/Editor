import { CinematicTrackType, ICinematicAnimationGroupTrack, ICinematicPropertyTrack } from "./track";

export interface ICinematicCamera {
	/**
	 * Defines the id of the camera used for the cinematic.
	 */
	cameraId: string;

	/**
	 * Defines the list of animation keys for camera's fov.
	 */
	fov: ICinematicTrack;
	/**
	 * Defines the list of animation keys for camera's position.
	 */
	position: ICinematicTrack;
	/**
	 * Defines the list of animation keys for camera's rotation.
	 */
	rotation: ICinematicTrack;
}

export interface ICinematicTrack {
	/**
	 * Defines the type of the cinematic track.
	 */
	type: CinematicTrackType;
	/**
	 * In case of property track, defines the configuration of the animated property.
	 */
	property?: ICinematicPropertyTrack;
	/**
	 * In case of animation group track, defines the configuration of the animation group.
	 */
	animationGroup?: ICinematicAnimationGroupTrack;
}

export interface ICinematic {
	/**
	 * Defines the name of the cinematic.
	 */
	name: string;
	/**
	 * Defines the current 
	 */
	framesPerSecond: number;
	/**
	 * Defines the reference to the camera's configuration for the cinematic.
	 */
	camera: ICinematicCamera;
	/**
	 * Defines the list of all cinematic tracks.
	 */
	tracks: ICinematicTrack[];
}
