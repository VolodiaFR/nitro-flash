import { ConditionDefinition, CopyWiredConfigMessageComposer, OpenMessageComposer, PasteWiredConfigMessageComposer, SetWiredClipboardAutopasteMessageComposer, Triggerable, TriggerDefinition, UpdateActionMessageComposer, UpdateAddonMessageComposer, UpdateConditionMessageComposer, UpdateSelectorMessageComposer, UpdateTriggerMessageComposer, WiredActionDefinition, WiredAddonDefinition, WiredClipboardStatusAction, WiredClipboardStatusEntry, WiredClipboardStatusMessageEvent, WiredFurniActionEvent, WiredFurniAddonEvent, WiredFurniConditionEvent, WiredFurniSelectorEvent, WiredFurniTriggerEvent, WiredOpenEvent, WiredSaveSuccessEvent, WiredSelectorDefinition } from '@nitrots/nitro-renderer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBetween } from 'use-between';
import { IsOwnerOfFloorFurniture, LocalizeText, RoomWidgetUpdateRoomObjectEvent, SendMessageComposer, WiredFurniType, WiredSelectionVisualizer } from '../../api';
import { useMessageEvent } from '../events';
import { useNotification } from '../notification';
import { useObjectDoubleClickedEvent } from '../rooms';

interface WiredClipboardStatusState
{
    action: WiredClipboardStatusAction;
    success: boolean;
    message: string;
}

const cloneTriggerable = <T extends Triggerable>(definition: T): T =>
{
    if (!definition) return null as T;

    const clone = Object.create(Object.getPrototypeOf(definition));

    for (const key of Object.getOwnPropertyNames(definition))
    {
        const value = (definition as any)[key];

        if (Array.isArray(value))
        {
            clone[key] = value.map(item =>
            {
                if (item && (typeof item === 'object')) return { ...item };

                return item;
            });
        }
        else if (value && (typeof value === 'object'))
        {
            clone[key] = { ...value };
        }
        else
        {
            clone[key] = value;
        }
    }

    return clone as T;
};

const useWiredState = () =>
{
    const [trigger, setTrigger] = useState<Triggerable>(null);
    const [intParams, setIntParams] = useState<number[]>([]);
    const [stringParam, setStringParam] = useState<string>('');
    const [furniIds, setFurniIds] = useState<number[]>([]);
    const [destFurniIds, setDestFurniIds] = useState<number[]>([]);
    const [actionDelay, setActionDelay] = useState<number>(0);
    //Selector
    const [isFiltered, setIsFiltered] = useState<number>(0);
    const [isInverted, setIsInverted] = useState<number>(0);
    //Action
    const [furniOptions, setFurniOptions] = useState<number>(0);
    const [furniType, setFurniType] = useState<number>(0);
    const [userOptions, setUserOptions] = useState<number>(0);
    const [userType, setUserType] = useState<number>(0);
    const [allOrOneOptions, setAllOrOneOptions] = useState<number>(0);
    const [allOrOneType, setAllOrOneType] = useState<number>(0);
    const [allowsFurni, setAllowsFurni] = useState<number>(WiredFurniType.STUFF_SELECTION_OPTION_NONE);
    const [selectMode, setSelectMode] = useState<number>(0); // 0 none, 1 source (yellow), 2 dest (blue)
    const [preferredSelectionColor, setPreferredSelectionColor] = useState<number>(0); // 0 = default gray, 1 = yellow (furnitofurni only)
    const [allowYellowSelection, setAllowYellowSelection] = useState<boolean>(false);
    const [clipboardEntry, setClipboardEntry] = useState<WiredClipboardStatusEntry>(null);
    const [clipboardStatus, setClipboardStatus] = useState<WiredClipboardStatusState>(null);
    const [autoPasteEnabled, setAutoPasteEnabled] = useState<boolean>(false);
    const [activeStuffId, setActiveStuffId] = useState<number>(null);
    const initialTriggerRef = useRef<Triggerable>(null);
    const silentCopyRef = useRef(false);
    const { showConfirm = null, simpleAlert = null } = useNotification();

    const resetInitialSnapshot = () =>
    {
        initialTriggerRef.current = null;
    };

    const applyTriggerDefinition = useCallback((definition: Triggerable | null) =>
    {
        if (definition)
        {
            const currentSnapshotId = initialTriggerRef.current?.id;

            if (!initialTriggerRef.current || (currentSnapshotId !== definition.id))
            {
                initialTriggerRef.current = cloneTriggerable(definition);
            }
        }

        setTrigger(definition);
    }, []);

    const sendConfigurationFromState = useCallback((definition: Triggerable | null) =>
    {
        if (!definition) return false;

        if (definition instanceof WiredActionDefinition)
        {
            SendMessageComposer(new UpdateActionMessageComposer(definition.id, intParams, stringParam, furniIds, actionDelay, furniOptions, furniType, userOptions, userType, definition.stuffTypeSelectionCode, destFurniIds));
            return true;
        }

        if (definition instanceof TriggerDefinition)
        {
            SendMessageComposer(new UpdateTriggerMessageComposer(definition.id, intParams, stringParam, furniIds, definition.stuffTypeSelectionCode));
            return true;
        }

        if (definition instanceof ConditionDefinition)
        {
            SendMessageComposer(new UpdateConditionMessageComposer(definition.id, intParams, stringParam, furniIds, furniOptions, furniType, userOptions, userType, allOrOneOptions, allOrOneType));
            return true;
        }

        if (definition instanceof WiredSelectorDefinition)
        {
            SendMessageComposer(new UpdateSelectorMessageComposer(definition.id, intParams, stringParam, furniIds, isFiltered, isInverted, definition.stuffTypeSelectionCode));
            return true;
        }

        if (definition instanceof WiredAddonDefinition)
        {
            SendMessageComposer(new UpdateAddonMessageComposer(definition.id, intParams, stringParam, furniIds, definition.stuffTypeSelectionCode));
            return true;
        }

        return false;
    }, [intParams, stringParam, furniIds, actionDelay, furniOptions, furniType, userOptions, userType, allOrOneOptions, allOrOneType, isFiltered, isInverted, destFurniIds]);

    const sendConfigurationFromDefinition = useCallback((definition: Triggerable | null) =>
    {
        if (!definition) return false;

        if (definition instanceof WiredActionDefinition)
        {
            const destinationItems = definition.destinationSelectedItems || [];

            SendMessageComposer(new UpdateActionMessageComposer(definition.id, definition.intData || [], definition.stringData || '', definition.selectedItems || [], definition.delayInPulses, definition.furniOptions, definition.furniType, definition.userOptions, definition.userType, definition.stuffTypeSelectionCode, destinationItems));
            return true;
        }

        if (definition instanceof TriggerDefinition)
        {
            SendMessageComposer(new UpdateTriggerMessageComposer(definition.id, definition.intData || [], definition.stringData || '', definition.selectedItems || [], definition.stuffTypeSelectionCode));
            return true;
        }

        if (definition instanceof ConditionDefinition)
        {
            SendMessageComposer(new UpdateConditionMessageComposer(definition.id, definition.intData || [], definition.stringData || '', definition.selectedItems || [], definition.furniOptions, definition.furniType, definition.userOptions, definition.userType, definition.allOrOneOptions, definition.allOrOneType));
            return true;
        }

        if (definition instanceof WiredSelectorDefinition)
        {
            SendMessageComposer(new UpdateSelectorMessageComposer(definition.id, definition.intData || [], definition.stringData || '', definition.selectedItems || [], definition.isFiltered, definition.isInverted, definition.stuffTypeSelectionCode));
            return true;
        }

        if (definition instanceof WiredAddonDefinition)
        {
            SendMessageComposer(new UpdateAddonMessageComposer(definition.id, definition.intData || [], definition.stringData || '', definition.selectedItems || [], definition.stuffTypeSelectionCode));
            return true;
        }

        return false;
    }, []);

    const pushWiredConfiguration = useCallback(() => sendConfigurationFromState(trigger), [trigger, sendConfigurationFromState]);

    const handleNonOwnerAction = useCallback((callback: () => void) =>
    {
        if (!trigger)
        {
            return;
        }

        if (!IsOwnerOfFloorFurniture(trigger.id) && showConfirm)
        {
            showConfirm(LocalizeText('wiredfurni.nonowner.change.confirm.body'), callback, null, null, null, LocalizeText('wiredfurni.nonowner.change.confirm.title'));
            return;
        }

        callback();
    }, [trigger, showConfirm]);

    const saveWired = useCallback(() =>
    {
        if (!trigger)
        {
            return;
        }

        handleNonOwnerAction(() => pushWiredConfiguration());
    }, [trigger, pushWiredConfiguration, handleNonOwnerAction]);

    const copyWiredClipboard = useCallback((silent = false, syncWithUiState = false, skipOwnerGuard = false) =>
    {
        if (!trigger) return;

        const doCopy = () =>
        {
            if (silent) silentCopyRef.current = true;

            SendMessageComposer(new CopyWiredConfigMessageComposer(trigger.id));
        };

        if (syncWithUiState)
        {
            const revertSnapshot = cloneTriggerable(trigger);

            const syncAndCopy = () =>
            {
                const pushed = sendConfigurationFromState(trigger);

                doCopy();

                if (pushed && revertSnapshot) sendConfigurationFromDefinition(revertSnapshot);
            };

            if (skipOwnerGuard)
            {
                syncAndCopy();
                return;
            }

            handleNonOwnerAction(syncAndCopy);
            return;
        }

        if (skipOwnerGuard)
        {
            doCopy();
            return;
        }

        doCopy();
    }, [trigger, sendConfigurationFromState, sendConfigurationFromDefinition, handleNonOwnerAction]);

    const pasteWiredClipboard = useCallback(() =>
    {
        if (!trigger) return;

        SendMessageComposer(new PasteWiredConfigMessageComposer(trigger.id));
    }, [trigger]);

    const setClipboardAutoPaste = useCallback((enabled: boolean) =>
    {
        setAutoPasteEnabled(enabled);
        SendMessageComposer(new SetWiredClipboardAutopasteMessageComposer(enabled));
    }, []);

    const handleAutoPasteDoubleClick = useCallback((event: RoomWidgetUpdateRoomObjectEvent) =>
    {
        if (!autoPasteEnabled || !trigger || !copyWiredClipboard) return;

        if (!event || (event.objectId === trigger.id)) return;

        copyWiredClipboard(true, true, true);
    }, [autoPasteEnabled, trigger, copyWiredClipboard]);

    useObjectDoubleClickedEvent(handleAutoPasteDoubleClick);

    const clearFurniSelection = () =>
    {
        setFurniIds(prevValue =>
        {
            if (prevValue && prevValue.length) WiredSelectionVisualizer.clearSelectionShaderFromFurni(prevValue);

            return [];
        });

        setDestFurniIds(prevValue =>
        {
            if (prevValue && prevValue.length) WiredSelectionVisualizer.clearSelectionShaderFromFurniBlue(prevValue);

            return [];
        });
    };

    const reloadCurrentWired = useCallback(() =>
    {
        if (initialTriggerRef.current && trigger && (initialTriggerRef.current.id === trigger.id))
        {
            setTrigger(cloneTriggerable(initialTriggerRef.current));
            return;
        }

        const stuffId = activeStuffId ?? trigger?.id;

        if (!stuffId) return;

        SendMessageComposer(new OpenMessageComposer(stuffId));
    }, [activeStuffId, trigger]);

    const selectObjectForWired = (objectId: number, category: number) =>
    {
        if (!trigger || !allowsFurni) return;
        if (autoPasteEnabled) return;
        if (objectId <= 0) return;

        // if selectMode is 0 -> default (source/yellow), 1 -> source (yellow), 2 -> destination (blue)
        if (selectMode === 0 || selectMode === 1)
        {
            setFurniIds(prevValue =>
            {
                const newFurniIds = [...prevValue];

                const index = prevValue.indexOf(objectId);

                if (index >= 0)
                {
                    newFurniIds.splice(index, 1);
                    // Clear whatever shader was applied to this furni
                    WiredSelectionVisualizer.clearSelectionShaderFromFurni([objectId]);
                }

                else if (newFurniIds.length < trigger.maximumItemSelectionCount)
                {
                    newFurniIds.push(objectId);
                    if (preferredSelectionColor === 1 && allowYellowSelection) WiredSelectionVisualizer.applySelectionShaderToFurniYellow([objectId]);
                    else WiredSelectionVisualizer.applySelectionShaderToFurni([objectId]);
                }

                return newFurniIds;
            });

            // Ensure the object is not in destination set at the same time
            setDestFurniIds(prevDest =>
            {
                if (!prevDest || prevDest.length === 0) return prevDest;
                const idx = prevDest.indexOf(objectId);
                if (idx >= 0) {
                    const newDest = [...prevDest];
                    newDest.splice(idx, 1);
                    WiredSelectionVisualizer.clearSelectionShaderFromFurniBlue([objectId]);
                    return newDest;
                }
                return prevDest;
            });
        }
        else if (selectMode === 2)
        {
            setDestFurniIds(prevValue =>
            {
                const newFurniIds = [...prevValue];

                const index = prevValue.indexOf(objectId);

                if (index >= 0)
                {
                    newFurniIds.splice(index, 1);
                    WiredSelectionVisualizer.clearSelectionShaderFromFurniBlue([objectId]);
                }

                else if (newFurniIds.length < trigger.maximumItemSelectionCount)
                {
                    newFurniIds.push(objectId);
                    WiredSelectionVisualizer.applySelectionShaderToFurniBlue([objectId]);
                }

                return newFurniIds;
            });

            // Ensure the object is not in source set at the same time
            setFurniIds(prevSrc =>
            {
                if (!prevSrc || prevSrc.length === 0) return prevSrc;
                const idx = prevSrc.indexOf(objectId);
                if (idx >= 0) {
                    const newSrc = [...prevSrc];
                    newSrc.splice(idx, 1);
                    // Clear either the yellow or gray shader from furni
                    WiredSelectionVisualizer.clearSelectionShaderFromFurni([objectId]);
                    return newSrc;
                }
                return prevSrc;
            });
        }
    };

    useMessageEvent<WiredOpenEvent>(WiredOpenEvent, event =>
    {
        const parser = event.getParser();

        resetInitialSnapshot();
        setActiveStuffId(parser.stuffId);
        SendMessageComposer(new OpenMessageComposer(parser.stuffId));
    });

    useMessageEvent<WiredSaveSuccessEvent>(WiredSaveSuccessEvent, () =>
    {
        resetInitialSnapshot();
        setActiveStuffId(null);
        applyTriggerDefinition(null);
    });
    
    useMessageEvent<WiredFurniSelectorEvent>(WiredFurniSelectorEvent, event =>
    {
        const parser = event.getParser();

        applyTriggerDefinition(parser.definition);
    });
    
    useMessageEvent<WiredFurniAddonEvent>(WiredFurniAddonEvent, event =>
    {
        const parser = event.getParser();

        applyTriggerDefinition(parser.definition);
    });

    useMessageEvent<WiredFurniActionEvent>(WiredFurniActionEvent, event =>
    {
        const parser = event.getParser();

        applyTriggerDefinition(parser.definition);
    });

    useMessageEvent<WiredFurniConditionEvent>(WiredFurniConditionEvent, event =>
    {
        const parser = event.getParser();

        applyTriggerDefinition(parser.definition);
    });

    useMessageEvent<WiredFurniTriggerEvent>(WiredFurniTriggerEvent, event =>
    {
        const parser = event.getParser();

        applyTriggerDefinition(parser.definition);
    });

    useMessageEvent<WiredClipboardStatusMessageEvent>(WiredClipboardStatusMessageEvent, event =>
    {
        const parser = event.getParser();

        setClipboardEntry(parser.entry);
        setClipboardStatus({ action: parser.action, success: parser.success, message: parser.feedback });
        setAutoPasteEnabled(parser.autoPasteEnabled);
        const suppressCopyAlert = (parser.action === WiredClipboardStatusAction.COPY) && silentCopyRef.current;

        if (suppressCopyAlert) silentCopyRef.current = false;

        if (!suppressCopyAlert && (parser.action !== WiredClipboardStatusAction.AUTO_PASTE) && simpleAlert && parser.feedback)
        {
            // simpleAlert(parser.feedback, null, null, null, LocalizeText('wiredfurni.title'));
        }

    });

    useEffect(() =>
    {
        if (trigger || !autoPasteEnabled) return;

        setClipboardAutoPaste(false);
    }, [trigger, autoPasteEnabled, setClipboardAutoPaste]);

    useEffect(() =>
    {
        if (trigger) return;

        setActiveStuffId(null);
        resetInitialSnapshot();
    }, [trigger]);

    useEffect(() =>
    {
        if (!trigger) return;
        if (trigger)
        {
            WiredSelectionVisualizer.hideSelectedWired(trigger.id);
        }

        return () =>
        {
            if (trigger)
            {
                WiredSelectionVisualizer.hideSelectedWired(trigger.id);
            }
            setIntParams([]);
            setStringParam('');
            setActionDelay(0);
            setFurniOptions(0);
            setFurniType(0);
            setUserOptions(0);
            setUserType(0);
            setIsFiltered(0);
            setIsInverted(0);
            setFurniIds(prevValue =>
            {
                if (prevValue && prevValue.length) WiredSelectionVisualizer.clearSelectionShaderFromFurni(prevValue);

                return [];
            });
            setDestFurniIds(prevValue =>
            {
                if (prevValue && prevValue.length) WiredSelectionVisualizer.clearSelectionShaderFromFurniBlue(prevValue);

                return [];
            });
            setAllowsFurni(WiredFurniType.STUFF_SELECTION_OPTION_NONE);
            setSelectMode(0);
        };
    }, [trigger]);

    return { trigger, setTrigger, intParams, setIntParams, stringParam, setStringParam, furniIds, setFurniIds, destFurniIds, setDestFurniIds, actionDelay, setActionDelay, isFiltered, setIsFiltered, isInverted, setIsInverted, furniOptions, setFurniOptions, furniType, setFurniType, userOptions, setUserOptions, userType, setUserType, selectMode, setSelectMode, setAllowsFurni, saveWired, selectObjectForWired, allOrOneOptions, setAllOrOneOptions, allOrOneType, setAllOrOneType, preferredSelectionColor, setPreferredSelectionColor, allowYellowSelection, setAllowYellowSelection, clipboardEntry, clipboardStatus, autoPasteEnabled, copyWiredClipboard, pasteWiredClipboard, setClipboardAutoPaste, clearFurniSelection, reloadCurrentWired };
};

export const useWired = () => useBetween(useWiredState);
