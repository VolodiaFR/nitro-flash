import { IMessageComposer } from '../../../../../api';

export class SetWiredClipboardAutopasteMessageComposer implements IMessageComposer<[boolean]>
{
    private _data: [boolean];

    constructor(enabled: boolean)
    {
        this._data = [ enabled ];
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
