import { RoomUnitStatusAction } from "./RoomUnitStatusAction";

export class RoomUnitStatusCustomMessage
{
    private _id: number;
    private _x: number;
    private _y: number;
    private _z: number;
    private _height: number;
    private _headDirection: number;
    private _direction: number;
    private _targetX: number;
    private _targetY: number;
    private _targetZ: number;
    private _didMove: boolean;
    private _canStandUp: boolean;
    private _actions: RoomUnitStatusAction[];
    private _animationtime: number;

    constructor(id: number, x: number, y: number, z: number, height: number, headDirection: number, direction: number, targetX: number = 0, targetY: number = 0, targetZ: number = 0, didMove: boolean, canStandUp: boolean, actions: RoomUnitStatusAction[], animationtime: number = 0)
    {
        this._id = id;
        this._x = x;
        this._y = y;
        this._z = z;
        this._height = height;
        this._headDirection = headDirection;
        this._direction = direction;
        this._targetX = targetX;
        this._targetY = targetY;
        this._targetZ = targetZ;
        this._didMove = didMove;
        this._canStandUp = canStandUp;
        this._actions = actions || [];
        this._animationtime = animationtime;
    }

    public get id(): number
    {
        return this._id;
    }

    public get x(): number
    {
        return this._x;
    }

    public get y(): number
    {
        return this._y;
    }

    public get z(): number
    {
        return this._z;
    }

    public get height(): number
    {
        return this._height;
    }

    public get headDirection(): number
    {
        return this._headDirection;
    }

    public get direction(): number
    {
        return this._direction;
    }

    public get targetX(): number
    {
        return this._targetX;
    }

    public get targetY(): number
    {
        return this._targetY;
    }

    public get targetZ(): number
    {
        return this._targetZ;
    }

    public get didMove(): boolean
    {
        return this._didMove;
    }

    public get canStandUp(): boolean
    {
        return this._canStandUp;
    }

    public get actions(): RoomUnitStatusAction[]
    {
        return this._actions;
    }

    public get animationtime(): number
    {
        return this._animationtime;
    }
}