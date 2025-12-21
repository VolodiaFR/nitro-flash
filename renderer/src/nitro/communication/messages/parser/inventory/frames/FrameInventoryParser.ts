import { IMessageDataWrapper, IMessageParser } from '../../../../../../api';

export interface IInventoryFrameItem
{
    frameId: number;
    frameCode: string;
    isActive: boolean;
}

export class FrameInventoryParser implements IMessageParser
{
    private _frames: IInventoryFrameItem[];

    public flush(): boolean
    {
        this._frames = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._frames = [];

        let total = wrapper.readInt();

        while(total > 0)
        {
            const frameId = wrapper.readInt();
            const frameCode = wrapper.readString();
            const isActive = wrapper.readBoolean();

            this._frames.push({ frameId, frameCode, isActive });

            total--;
        }

        return true;
    }

    public get frames(): IInventoryFrameItem[]
    {
        return this._frames;
    }

    public get activeFrame(): IInventoryFrameItem
    {
        return (this._frames && this._frames.length) ? this._frames.find(frame => frame.isActive) : null;
    }
}
