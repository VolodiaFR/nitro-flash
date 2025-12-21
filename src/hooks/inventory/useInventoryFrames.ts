import { FrameInventoryEvent, GetAvatarFramesComposer, IInventoryFrameItem, SetActivatedFrameComposer } from '@nitrots/nitro-renderer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBetween } from 'use-between';
import { SendMessageComposer, UnseenItemCategory } from '../../api';
import { useMessageEvent } from '../events';
import { useSharedVisibility } from '../useSharedVisibility';
import { useInventoryUnseenTracker } from './useInventoryUnseenTracker';

const useInventoryFramesState = () =>
{
    const [ needsUpdate, setNeedsUpdate ] = useState(true);
    const [ frames, setFrames ] = useState<IInventoryFrameItem[]>([]);
    const [ selectedFrameCode, setSelectedFrameCode ] = useState<string>(null);
    const { isVisible = false, activate = null, deactivate = null } = useSharedVisibility();
    const { resetCategory = null } = useInventoryUnseenTracker();

    const activeFrameCode = useMemo(() =>
    {
        const activeFrame = frames.find(frame => frame.isActive);

        return activeFrame ? activeFrame.frameCode : null;
    }, [ frames ]);

    const frameCodes = useMemo(() => frames.map(frame => frame.frameCode), [ frames ]);

    const getFrameId = useCallback((frameCode: string) =>
    {
        if(!frameCode) return 0;

        const frame = frames.find(value => value.frameCode === frameCode);

        return frame ? frame.frameId : 0;
    }, [ frames ]);

    const isFrameActive = useCallback((frameCode: string) => (!!frameCode && (frameCode === activeFrameCode)), [ activeFrameCode ]);

    const toggleFrame = useCallback((frameCode: string) =>
    {
        if(!frameCode) return;

        if(frameCode === activeFrameCode)
        {
            SendMessageComposer(new SetActivatedFrameComposer(frameCode, false));

            return;
        }

        SendMessageComposer(new SetActivatedFrameComposer(frameCode, true));
    }, [ activeFrameCode ]);

    const clearFrame = useCallback(() =>
    {
        if(!activeFrameCode) return;

        SendMessageComposer(new SetActivatedFrameComposer(activeFrameCode, false));
    }, [ activeFrameCode ]);

    useMessageEvent<FrameInventoryEvent>(FrameInventoryEvent, event =>
    {
        const parser = event.getParser();
        const receivedFrames = parser.frames || [];
        const activeFrame = parser.activeFrame;

        setFrames(receivedFrames);
        setSelectedFrameCode(prevValue =>
        {
            if(activeFrame) return activeFrame.frameCode;

            if(prevValue && receivedFrames.some(frame => frame.frameCode === prevValue)) return prevValue;

            return receivedFrames.length ? receivedFrames[0].frameCode : null;
        });

        setNeedsUpdate(false);
    });

    useEffect(() =>
    {
        if(!isVisible || !needsUpdate) return;

        setNeedsUpdate(false);
        SendMessageComposer(new GetAvatarFramesComposer());
    }, [ isVisible, needsUpdate ]);

    useEffect(() =>
    {
        if(!isVisible) return;

        return () => resetCategory(UnseenItemCategory.FRAME);
    }, [ isVisible, resetCategory ]);

    return { frames, frameCodes, selectedFrameCode, setSelectedFrameCode, activeFrameCode, isFrameActive, toggleFrame, clearFrame, getFrameId, activate, deactivate };
}

export const useInventoryFrames = () => useBetween(useInventoryFramesState);
