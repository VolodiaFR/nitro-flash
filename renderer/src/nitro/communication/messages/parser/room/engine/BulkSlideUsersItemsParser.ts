import { IMessageDataWrapper, IMessageParser, NitroLogger } from '../../../../../../api';


export class BulkSlideUsersItemsParser implements IMessageParser
{

    private _itemSlides: Array<{
        virtualId: number;
        fromX: number;
        fromY: number;
        fromZ: string;
        toX: number;
        toY: number;
        toZ: string;
        fromRotation: number;
        toRotation: number;
    }>;

    private _playersSlides: Array<{
        roomIndex: number;
        fromX: number;
        fromY: number;
        fromZ: string;
        toX: number;
        toY: number;
        toZ: string;
        fromStatus: string;
        toStatus: string;
        fromRotation: number;
        toRotation: number;
    }>;


    constructor()
    {
        this._itemSlides = [];
        this._playersSlides = [];
    }

    public flush(): boolean {
        this._itemSlides = [];
        this._playersSlides = [];
        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean {
        if(!wrapper) return false;

        const itemCount = wrapper.readInt();
        this._itemSlides = [];


        for(let i = 0; i < itemCount; i++) {
            const virtualId = wrapper.readInt();
            const fromX = wrapper.readInt();
            const fromY = wrapper.readInt();
            const fromZ = wrapper.readString();
            const toX = wrapper.readInt();
            const toY = wrapper.readInt();
            const toZ = wrapper.readString();
            const fromRotation = wrapper.readInt();
            const toRotation = wrapper.readInt();

            this._itemSlides.push({
                virtualId,
                fromX,
                fromY,
                fromZ,
                toX,
                toY,
                toZ,
                fromRotation,
                toRotation
            });
        }

        const playersCount = wrapper.readInt();

        this._playersSlides = [];

        for(let i = 0; i < playersCount; i++) {
            
            const roomIndex = wrapper.readInt();
            const fromX = wrapper.readInt();
            const fromY = wrapper.readInt();
            const fromZ = wrapper.readString();
            const toX = wrapper.readInt();
            const toY = wrapper.readInt();
            const toZ = wrapper.readString();
            const fromStatus = wrapper.readString();
            const toStatus = wrapper.readString();
            const fromRotation = wrapper.readInt();
            const toRotation = wrapper.readInt();

            this._playersSlides.push({
                roomIndex,
                fromX,
                fromY,
                fromZ,
                toX,
                toY,
                toZ,
                fromStatus,
                toStatus,
                fromRotation,
                toRotation
            });
        }



        return true;
    }

    public get itemSlides(): Array<{
        virtualId: number;
        fromX: number;
        fromY: number;
        fromZ: string;
        toX: number;
        toY: number;
        toZ: string;
        fromRotation: number;
        toRotation: number;
    }>
    {
        return this._itemSlides;
    }

    public get playerSlides(): Array<{
        roomIndex: number;
        fromX: number;
        fromY: number;
        fromZ: string;
        toX: number;
        toY: number;
        toZ: string;
        fromStatus: string;
        toStatus: string;
        fromRotation: number;
        toRotation: number;
    }>
    {
        return this._playersSlides;
    }
}
