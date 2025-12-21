import { IMessageComposer } from '../../../../../../api';

export class GetAvatarFramesComposer implements IMessageComposer<void>
{
    public getMessageArray()
    {
        return [];
    }

    public dispose(): void
    {
        return;
    }
}
