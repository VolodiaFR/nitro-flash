import { IVector3D } from '../../../room';

export class ObjectRolling
{
    public static MOVE: string = 'mv';
    public static SLIDE: string = 'sld';

    private _id: number;
    private _location: IVector3D;
    private _targetLocation: IVector3D;
    private _movementType: string;
    private _animationTime: number;
    private _posture: string | null;
    private _postureParam: string | null;

    constructor(id: number, location: IVector3D, targetLocation: IVector3D, movementType: string = null, animationTime: number = 500, posture: string = null, postureParam: string = null)
    {
        this._id = id;
        this._location = location;
        console.log(location)
        this._targetLocation = targetLocation;
        this._movementType = movementType;
        this._animationTime = animationTime;
        this._posture = posture;
        this._postureParam = postureParam;
    }

    public get id(): number
    {
        return this._id;
    }

    public get location(): IVector3D
    {
        return this._location;
    }

    public get targetLocation(): IVector3D
    {
        return this._targetLocation;
    }

    public get movementType(): string
    {
        return this._movementType;
    }

    public get animationTime(): number
    {
        return this._animationTime;
    }

    public get posture(): string | null
    {
        return this._posture;
    }

    public get postureParam(): string | null
    {
        return this._postureParam;
    }
}
