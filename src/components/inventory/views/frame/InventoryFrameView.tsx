import { FC, useEffect, useMemo, useState } from 'react';
import { GetSessionDataManager, LocalizeText, UnseenItemCategory } from '../../../../api';
import { AutoGrid, Button, Column, Flex, LayoutAvatarImageView, Text } from '../../../../common';
import { useFrameAsset, useInventoryFrames, useInventoryUnseenTracker } from '../../../../hooks';
import { InventoryCategoryEmptyView } from '../InventoryCategoryEmptyView';
import { InventoryFrameItemView } from './InventoryFrameItemView';

interface InventoryFrameViewProps
{
    filteredFrameCodes: string[];
}

export const InventoryFrameView: FC<InventoryFrameViewProps> = props =>
{
    const { filteredFrameCodes = [] } = props;
    const [ isVisible, setIsVisible ] = useState(false);
    const { frames = [], frameCodes = [], selectedFrameCode = null, setSelectedFrameCode, activeFrameCode = null, isFrameActive, toggleFrame, clearFrame, getFrameId, activate, deactivate } = useInventoryFrames();
    const { isUnseen = null, removeUnseen = null } = useInventoryUnseenTracker();
    const sessionFigure = GetSessionDataManager().figure;
    const previewUrl = useFrameAsset(selectedFrameCode, 'profile');

    const displayCodes = useMemo(() =>
    {
        if(filteredFrameCodes && filteredFrameCodes.length) return filteredFrameCodes;

        return frameCodes;
    }, [ filteredFrameCodes, frameCodes ]);

    const visibleFrames = useMemo(() =>
    {
        if(!displayCodes || !displayCodes.length) return frames;

        return frames.filter(frame => displayCodes.indexOf(frame.frameCode) >= 0);
    }, [ frames, displayCodes ]);

    const selectedFrame = frames.find(frame => frame.frameCode === selectedFrameCode) || null;

    useEffect(() =>
    {
        if(!isVisible) return;

        const id = activate();

        return () => deactivate(id);
    }, [ isVisible, activate, deactivate ]);

    useEffect(() =>
    {
        setIsVisible(true);

        return () => setIsVisible(false);
    }, []);

    useEffect(() =>
    {
        if(!selectedFrameCode || !isUnseen || !removeUnseen) return;

        const frameId = getFrameId(selectedFrameCode);

        if(!frameId || !isUnseen(UnseenItemCategory.FRAME, frameId)) return;

        removeUnseen(UnseenItemCategory.FRAME, frameId);
    }, [ selectedFrameCode, getFrameId, isUnseen, removeUnseen ]);

    useEffect(() =>
    {
        if(!visibleFrames.length) return;

        if(visibleFrames.some(frame => frame.frameCode === selectedFrameCode)) return;

        setSelectedFrameCode(visibleFrames[0].frameCode);
    }, [ visibleFrames, selectedFrameCode, setSelectedFrameCode ]);

    if(!frames.length)
    {
        return <InventoryCategoryEmptyView fullWidth title={ LocalizeText('inventory.frames.empty.title') } desc={ LocalizeText('inventory.frames.empty.desc') } />;
    }

    return (
        <Flex gap={ 2 } className="inventory-frames h-100">
            <Column grow overflow="hidden" className="inventory-frames-grid">
                { (visibleFrames.length > 0) &&
                    <AutoGrid gap={ 1 } columnCount={ 2 }>
                        { visibleFrames.map(frame => <InventoryFrameItemView key={ frame.frameId } frameCode={ frame.frameCode } figure={ sessionFigure } />) }
                    </AutoGrid>
                }
                { (!visibleFrames.length) &&
                    <Flex fullHeight center className="inventory-frames__empty-search">
                        <Text small center>{ LocalizeText('inventory.frames.filter.empty') }</Text>
                    </Flex>
                }
            </Column>
            <Column className="inventory-frames-preview" justifyContent="between" gap={ 2 }>
                <Column gap={ 1 }>
                    <Text bold>{ LocalizeText('inventory.frames.preview.title') }</Text>
                    <Text small>{ LocalizeText('inventory.frames.preview.desc') }</Text>
                </Column>
                <div className="inventory-frame-preview-stage">
                    <LayoutAvatarImageView figure={ sessionFigure } direction={ 2 } className="inventory-frame-preview-avatar" />
                    { previewUrl && <div className="inventory-frame-preview-overlay" style={ { backgroundImage: `url(${ previewUrl })` } } /> }
                </div>
                <Column gap={ 1 }>
                    <Text bold small>{ selectedFrameCode || LocalizeText('inventory.frames.preview.placeholder') }</Text>
                    <Text small wrap>
                        { selectedFrame ? LocalizeText(isFrameActive("frame." + selectedFrame.frameCode) ? 'inventory.frames.state.active' : 'inventory.frames.state.inactive') : LocalizeText('inventory.frames.preview.selectone') }
                    </Text>
                </Column>
                <Column gap={ 1 }>
                    <Button className="btn btn-primary" disabled={ !selectedFrameCode } onClick={ () => toggleFrame(selectedFrameCode) }>
                        { LocalizeText(isFrameActive(selectedFrameCode) ? 'inventory.frames.button.remove' : 'inventory.frames.button.wear') }
                    </Button>
                    <Button disabled={ !activeFrameCode } variant="danger" onClick={ clearFrame }>
                        { LocalizeText('inventory.frames.button.clear') }
                    </Button>
                </Column>
            </Column>
        </Flex>
    );
}
