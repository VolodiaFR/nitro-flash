import { IMessageEvent } from '../../../../../api';
import { MessageEvent } from '../../../../../events';
import { WiredClipboardStatusMessageParser } from '../../parser';

export class WiredClipboardStatusMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredClipboardStatusMessageParser);
    }

    public getParser(): WiredClipboardStatusMessageParser
    {
        return this.parser as WiredClipboardStatusMessageParser;
    }
}
