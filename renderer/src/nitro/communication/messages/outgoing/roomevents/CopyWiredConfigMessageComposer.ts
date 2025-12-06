import { IMessageComposer } from '../../../../../api';

export class CopyWiredConfigMessageComposer implements IMessageComposer<[number]>
{
    private _data: [number];

    constructor(itemVirtualId: number)
    {
        this._data = [ itemVirtualId ];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
