import { IMessageEvent } from '../../../../../../api';
import { MessageEvent } from '../../../../../../events';
import { RoomUnitStatusCustomParser } from '../../../parser';

export class RoomUnitStatusCustomEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, RoomUnitStatusCustomParser);
    }

    public getParser(): RoomUnitStatusCustomParser
    {
        return this.parser as RoomUnitStatusCustomParser;
    }
}
