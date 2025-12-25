import { FC, useEffect, useState } from 'react';
import ReactSlider from 'react-slider';
import { LocalizeText, WiredFurniType } from '../../../../api';
import { Button, Column, Flex, Text } from '../../../../common';
import { useWired } from '../../../../hooks';
import { WiredActionBaseView } from './WiredActionBaseView';
import { WiredSliderArrows } from '../WiredSliderArrows';

const RANGE_MIN = 1;
const RANGE_MAX = 10;
const PARAM_MODE = 0;
const PARAM_RANGE = 1;
const PARAM_CHAT = 2;

type LimitVisionMode = 'apply' | 'clear';

const clampRangeLevel = (value: number) => {
    const numericValue = Number.isFinite(value) ? Math.round(value) : RANGE_MIN;

    if (numericValue < RANGE_MIN) return RANGE_MIN;
    if (numericValue > RANGE_MAX) return RANGE_MAX;

    return numericValue;
};

export const WiredActionLimitUserVisionView: FC = () => {
    const [mode, setMode] = useState<LimitVisionMode>('apply');
    const [rangeLevel, setRangeLevel] = useState<number>(1);
    const [seeChat, setSeeChat] = useState<boolean>(true);
    const { trigger = null, setIntParams = null } = useWired();

    useEffect(() => {
        if (!trigger) {
            setMode('apply');
            setRangeLevel(1);
            setSeeChat(true);
            return;
        }

        const params = trigger.intData || [];

        setMode(((params[PARAM_MODE] ?? 0) === 1) ? 'apply' : 'clear');
        setRangeLevel(clampRangeLevel(params[PARAM_RANGE] ?? 1));
        setSeeChat((params[PARAM_CHAT] ?? 1) === 1);
    }, [trigger]);

    const handleSliderChange = (value: number | readonly number[]) => {
        const numericValue = Array.isArray(value) ? value[0] : value;

        setRangeLevel(clampRangeLevel(numericValue));
    };

    const save = () => {
        if (!setIntParams) return;

        setIntParams([
            (mode === 'apply') ? 1 : 0,
            clampRangeLevel(rangeLevel),
            seeChat ? 1 : 0
        ]);
    };

    return (
        <WiredActionBaseView
            hasSpecialInput={true}
            requiresFurni={WiredFurniType.STUFF_SELECTION_OPTION_NONE}
            save={save}>
            <Column gap={1}>


                <Text className='goldfish-bold'>{LocalizeText('Modo de estado:')}</Text>
                <Flex column gap={2}>
                    <Flex gap={1}>
                        <input
                            className="form-check-radio-wired"
                            type="radio"
                            id="modeNormal"
                            checked={mode === 'apply'}
                            onChange={() => setMode('apply')}
                        />
                        <label className="form-check-label">
                            Aplicar efecto
                        </label>
                    </Flex>
                    <Flex gap={1} style={{ marginBottom: "5px" }}>
                        <input
                            className="form-check-radio-wired"
                            type="radio"
                            id="modeNormal"
                            checked={mode === 'clear'}
                            onChange={() => setMode('clear')}
                        />
                        <label className="form-check-label" >
                            Eliminar efecto
                        </label>
                    </Flex>

                </Flex>

                <hr className="m-0 bg-dark" />
                
                <Column>
                    <Flex alignItems="center" justifyContent="between" gap={1}>
                        <Text className='goldfish-bold' bold>{LocalizeText('Rango:')}</Text>
                        <input
                            type="number"
                            min={RANGE_MIN}
                            max={RANGE_MAX}
                            className="form-control form-control-sm w-25"
                            value={rangeLevel}
                            onChange={event => setRangeLevel(clampRangeLevel(Number(event.target.value)))} />
                    </Flex>
                    <WiredSliderArrows
                        min={RANGE_MIN}
                        max={RANGE_MAX}
                        value={rangeLevel}
                        onChange={handleSliderChange} />

                </Column>
                <hr className="m-0 bg-dark" />
                <Flex alignItems="center" gap={1} style={{ marginTop:"4px"}}>
                    <input
                        id="limit-vision-chat-toggle"
                        type="checkbox"
                        className="check-menu-wired"
                        checked={seeChat}
                        onChange={event => setSeeChat(event.target.checked)} />
                    <label style={{marginLeft:"7px"}}>
                        {LocalizeText('Limitar la visión del chat')}
                    </label>
                </Flex>
            </Column>
        </WiredActionBaseView>
    );
};
