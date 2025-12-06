import { IMessageDataWrapper, IMessageParser } from '../../../../../api';

export enum WiredClipboardStatusAction
{
    SYNC = 0,
    COPY = 1,
    PASTE = 2,
    AUTO_PASTE = 3,
    TOGGLE = 4,
    ERROR = 5
}

export enum WiredClipboardStatusKind
{
    TRIGGER = 0,
    CONDITION = 1,
    ACTION = 2,
    SELECTOR = 3,
    ADDON = 4
}

export interface WiredClipboardStatusEntry
{
    definitionId: number;
    spriteId: number;
    interactionType: string;
    wiredClassName: string;
    interfaceId: number;
    kind: WiredClipboardStatusKind;
    sourceItemId: number;
    roomId: number;
    displayName: string;
    copiedAt: number;
}

export class WiredClipboardStatusMessageParser implements IMessageParser
{
    private _action: WiredClipboardStatusAction = WiredClipboardStatusAction.SYNC;
    private _success = false;
    private _entry: WiredClipboardStatusEntry = null;
    private _autoPasteEnabled = false;
    private _feedback = '';

    public flush(): boolean
    {
        this._action = WiredClipboardStatusAction.SYNC;
        this._success = false;
        this._entry = null;
        this._autoPasteEnabled = false;
        this._feedback = '';

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if (!wrapper) return false;

        this._action = wrapper.readInt();
        this._success = wrapper.readBoolean();

        const hasEntry = wrapper.readBoolean();

        const definitionId = wrapper.readInt();
        const spriteId = wrapper.readInt();
        const interactionType = wrapper.readString();
        const wiredClassName = wrapper.readString();
        const interfaceId = wrapper.readInt();
        const kind = wrapper.readInt();
        const sourceItemId = wrapper.readDouble();
        const roomId = wrapper.readDouble();
        const displayName = wrapper.readString();
        const copiedAt = wrapper.readDouble();

        this._autoPasteEnabled = wrapper.readBoolean();
        this._feedback = wrapper.readString();

        if (hasEntry)
        {
            this._entry = {
                definitionId,
                spriteId,
                interactionType,
                wiredClassName,
                interfaceId,
                kind: (kind as WiredClipboardStatusKind),
                sourceItemId,
                roomId,
                displayName,
                copiedAt
            };
        }
        else
        {
            this._entry = null;
        }

        return true;
    }

    public get action(): WiredClipboardStatusAction
    {
        return this._action;
    }

    public get success(): boolean
    {
        return this._success;
    }

    public get entry(): WiredClipboardStatusEntry
    {
        return this._entry;
    }

    public get autoPasteEnabled(): boolean
    {
        return this._autoPasteEnabled;
    }

    public get feedback(): string
    {
        return this._feedback;
    }
}
