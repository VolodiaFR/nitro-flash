import { IMessageComposer } from '../../../../../../api';

export class SetActivatedFrameComposer implements IMessageComposer<[string, boolean]>
{
    constructor(
        private readonly _frameCode: string,
        private readonly _equip: boolean)
    {}

    public getMessageArray()
    {
        const code = (this._frameCode && this._frameCode.length) ? this._frameCode : '';

        return [ code, this._equip ];
    }

    public dispose(): void
    {
        return;
    }
}
