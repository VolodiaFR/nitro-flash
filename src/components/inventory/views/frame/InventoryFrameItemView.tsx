import { NitroConfiguration } from '@nitrots/nitro-renderer';
import { FC, useMemo } from 'react';
import { GetSessionDataManager, LocalizeText, UnseenItemCategory } from '../../../../api';
import { LayoutGridItem } from '../../../../common';
import { useInventoryFrames, useInventoryUnseenTracker } from '../../../../hooks';

interface InventoryFrameItemViewProps
{
    frameCode: string;
    figure: string;
}

export const InventoryFrameItemView: FC<InventoryFrameItemViewProps> = props =>
{
    const { frameCode = null, figure = null, ...rest } = props;
    const { selectedFrameCode = null, setSelectedFrameCode, isFrameActive, toggleFrame, getFrameId } = useInventoryFrames();
    const { isUnseen } = useInventoryUnseenTracker();
    const personalizationUrl = NitroConfiguration.getValue<string>('personalization.url');
    
    const previewUrl = useMemo(() =>
    {
        if(!personalizationUrl || !frameCode) return null;

        return `${ personalizationUrl }/${ frameCode }/profile.gif`;
    }, [ personalizationUrl, frameCode ]);

    const unseen = isUnseen(UnseenItemCategory.FRAME, getFrameId(frameCode));
    const isSelected = (selectedFrameCode === frameCode);
    const isActive = isFrameActive(frameCode);

    return (
        <LayoutGridItem style={{marginRight:"5px"}} className="inventory-items inventory-frame-item" itemActive={ isSelected } itemUnseen={ unseen && !isActive } onMouseDown={ () => setSelectedFrameCode(frameCode) } onDoubleClick={ () => toggleFrame(frameCode) } { ...rest }>
                { previewUrl && <div className="inventory-frame-item__overlay" style={ { backgroundImage: `url(${ previewUrl })` } } /> }
        </LayoutGridItem>
    );
}
