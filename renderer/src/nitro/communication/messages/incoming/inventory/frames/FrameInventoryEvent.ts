import { IMessageEvent } from '../../../../../../api';
import { MessageEvent } from '../../../../../../events';
import { FrameInventoryParser } from '../../../parser';

export class FrameInventoryEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, FrameInventoryParser);
    }

    public getParser(): FrameInventoryParser
    {
        return this.parser as FrameInventoryParser;
    }
}
