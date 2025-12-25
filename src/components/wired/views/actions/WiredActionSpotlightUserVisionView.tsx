import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import ReactSlider from 'react-slider';
import { LocalizeText, WiredFurniType } from '../../../../api';
import { Button, Column, Flex, Text } from '../../../../common';
import { useWired } from '../../../../hooks';
import { WiredActionBaseView } from './WiredActionBaseView';
import { WiredSliderArrows } from '../WiredSliderArrows';

const PARAM_MODE = 0;
const PARAM_RADIUS = 1;
const PARAM_FEATHER = 2;
const PARAM_OPACITY = 3;

const MIN_RADIUS_PERCENT = 10;
const MAX_RADIUS_PERCENT = 95;
const MIN_FEATHER_PERCENT = 0;
const MAX_FEATHER_PERCENT = 70;
const MIN_OPACITY_PERCENT = 10;
const MAX_OPACITY_PERCENT = 100;

const DEFAULT_RADIUS_PERCENT = 50;
const DEFAULT_FEATHER_PERCENT = 30;
const DEFAULT_OPACITY_PERCENT = 85;

type SpotlightMode = 'apply' | 'clear';

const clampValue = (value: number, min: number, max: number) => {
    if (Number.isNaN(value)) return min;

    return Math.max(min, Math.min(max, Math.round(value)));
};

export const WiredActionSpotlightUserVisionView: FC = () => {
    const [mode, setMode] = useState<SpotlightMode>('apply');
    const [radiusPercent, setRadiusPercent] = useState(DEFAULT_RADIUS_PERCENT);
    const [featherPercent, setFeatherPercent] = useState(DEFAULT_FEATHER_PERCENT);
    const [opacityPercent, setOpacityPercent] = useState(DEFAULT_OPACITY_PERCENT);
    const { trigger = null, setIntParams = null } = useWired();

    useEffect(() => {
        if (!trigger) {
            setMode('apply');
            setRadiusPercent(DEFAULT_RADIUS_PERCENT);
            setFeatherPercent(DEFAULT_FEATHER_PERCENT);
            setOpacityPercent(DEFAULT_OPACITY_PERCENT);
            return;
        }

        const params = trigger.intData || [];

        setMode(((params[PARAM_MODE] ?? 0) === 1) ? 'apply' : 'clear');
        setRadiusPercent(clampValue(params[PARAM_RADIUS] ?? DEFAULT_RADIUS_PERCENT, MIN_RADIUS_PERCENT, MAX_RADIUS_PERCENT));
        setFeatherPercent(clampValue(params[PARAM_FEATHER] ?? DEFAULT_FEATHER_PERCENT, MIN_FEATHER_PERCENT, MAX_FEATHER_PERCENT));
        setOpacityPercent(clampValue(params[PARAM_OPACITY] ?? DEFAULT_OPACITY_PERCENT, MIN_OPACITY_PERCENT, MAX_OPACITY_PERCENT));
    }, [trigger]);

    const sanitizedRadius = clampValue(radiusPercent, MIN_RADIUS_PERCENT, MAX_RADIUS_PERCENT);
    const sanitizedFeather = clampValue(featherPercent, MIN_FEATHER_PERCENT, MAX_FEATHER_PERCENT);
    const sanitizedOpacity = clampValue(opacityPercent, MIN_OPACITY_PERCENT, MAX_OPACITY_PERCENT);

    const spotlightMaskStyle = useMemo(() => {
        const falloffEnd = Math.min(100, sanitizedRadius + sanitizedFeather);
        const opacityValue = sanitizedOpacity / 100;

        return {
            opacity: (mode === 'apply') ? 1 : 0,
            backgroundImage: `radial-gradient(circle at 50% 42%, rgba(0, 0, 0, 0) ${sanitizedRadius}%, rgba(0, 0, 0, ${opacityValue}) ${falloffEnd}%)`
        } as CSSProperties;
    }, [mode, sanitizedRadius, sanitizedFeather, sanitizedOpacity]);

    const previewClasses = useMemo(() => {
        const base = 'wired-spotlight-preview';

        if (mode === 'clear') return `${base} wired-spotlight-preview--disabled`;

        return base;
    }, [mode]);

    const save = () => {
        if (!setIntParams) return;

        setIntParams([
            (mode === 'apply') ? 1 : 0,
            sanitizedRadius,
            sanitizedFeather,
            sanitizedOpacity
        ]);
    };

    const renderSlider = (label: string, value: number, min: number, max: number, setter: (value: number) => void, hint?: string) => {
        return (
            <Column gap={1}>
                <Flex alignItems="center" justifyContent="between" gap={1}>
                    <Text className='goldfish-bold'>{label}</Text>
                    <input
                        type="number"
                        min={min}
                        max={max}
                        className="form-control form-control-sm w-25"
                        value={value}
                        onChange={event => setter(clampValue(Number(event.target.value), min, max))} />
                </Flex>
                <WiredSliderArrows
                    min={min}
                    max={max}
                    value={value}
                    onChange={nextValue => {
                        const numericValue = Array.isArray(nextValue) ? nextValue[0] : nextValue;

                        setter(clampValue(numericValue, min, max));
                    }} />
                {hint && <Text small className="text-muted">{hint}</Text>}
            </Column>
        );
    };

    return (
        <WiredActionBaseView
            hasSpecialInput={true}
            requiresFurni={WiredFurniType.STUFF_SELECTION_OPTION_NONE}
            save={save}>
            <Column gap={1}>
                <Column gap={2}>
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
                        <Flex gap={1} style={{marginBottom:"5px"}}>
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
                </Column>
                <hr className="m-0 bg-dark" />

                {renderSlider(
                    LocalizeText('Radio:'),
                    sanitizedRadius,
                    MIN_RADIUS_PERCENT,
                    MAX_RADIUS_PERCENT,
                    setRadiusPercent,
                )}
                {renderSlider(
                    LocalizeText('Difuminado:'),
                    sanitizedFeather,
                    MIN_FEATHER_PERCENT,
                    MAX_FEATHER_PERCENT,
                    setFeatherPercent
                )}
                {renderSlider(
                    LocalizeText('Opacidad:'),
                    sanitizedOpacity,
                    MIN_OPACITY_PERCENT,
                    MAX_OPACITY_PERCENT,
                    setOpacityPercent
                )}
            </Column>
        </WiredActionBaseView>
    );
};
