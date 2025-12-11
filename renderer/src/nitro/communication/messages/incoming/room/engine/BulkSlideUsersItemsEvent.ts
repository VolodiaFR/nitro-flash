
import { BulkSlideUsersItemsParser } from '../../../../../../..';
import { IMessageEvent } from '../../../../../../api';
import { MessageEvent } from '../../../../../../events';

export class BulkSlideUsersItemsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, BulkSlideUsersItemsParser);
    }

    public getParser(): BulkSlideUsersItemsParser
    {
        return this.parser as BulkSlideUsersItemsParser;
    }
}