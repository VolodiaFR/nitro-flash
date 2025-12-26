import { FC, useMemo } from 'react';
import { Flex, Text } from '../../common';
import { useBattleBall } from '../../hooks';

const TEAM_META: Record<string, { label: string; accent: string }> = {
    red: { label: 'Equipo Rojo', accent: '#ff5f6d' },
    blue: { label: 'Equipo Azul', accent: '#4bb7ff' },
    green: { label: 'Equipo Verde', accent: '#6dd783' },
    yellow: { label: 'Equipo Amarillo', accent: '#ffd056' }
};

const TEAM_ORDER = [ 'red', 'green', 'blue', 'yellow' ];
const TIMER_BASE_URL = 'https://assets.hobbu.net/bball/timer';
const TIMER_DEFAULT_ASSET = `${ TIMER_BASE_URL }/timer_default.png`;
const timerFrameAsset = (value: number) => `${ TIMER_BASE_URL }/timer_${ value }.png`;
const clampTimerValue = (value: number) => Math.max(0, Math.min(10, value));

const formatTimer = (seconds: number) =>
{
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds % 60;
    return `${ minutes.toString().padStart(2, '0') }:${ remainder.toString().padStart(2, '0') }`;
};

export const BattleBallHudView: FC = () =>
{
    const { phase, hud, powerUp, usePowerUp } = useBattleBall();
    const showHud = (phase === 'running');
    const hasLiveHud = !!hud;
    const totalTiles = Math.max(0, hud?.totalTiles ?? 0);
    const tilesRemaining = Math.max(0, hud?.tilesRemaining ?? totalTiles);
    const capturedTiles = Math.max(0, (totalTiles - tilesRemaining));
    const timeRemaining = Math.max(0, hud?.timeRemaining ?? 0);
    const hasPowerUp = !!powerUp?.isActive;
    const autoTriggerSeconds = Math.max(0, powerUp?.autoTriggerIn ?? 0);
    const warmupSeconds = Math.max(0, powerUp?.warmupRemaining ?? 0);
    const isWarmupActive = hasPowerUp && warmupSeconds > 0;
    const canTriggerPowerUp = hasPowerUp && !isWarmupActive && Math.max(0, powerUp?.countdownRemaining ?? 0) > 0;

    const timerAsset = useMemo(() =>
    {
        if(!hasPowerUp) return null;
        return (powerUp?.warmupRemaining ?? 0) > 0 ? TIMER_DEFAULT_ASSET : timerFrameAsset(clampTimerValue(powerUp?.countdownRemaining ?? 0));
    }, [ hasPowerUp, powerUp ]);

    const powerUpIcon = useMemo(() =>
    {
        if(!hasPowerUp) return null;
        return powerUp?.assetUrl || (powerUp?.type ? `https://assets.hobbu.net/bball/${ powerUp.type }.png` : null);
    }, [ hasPowerUp, powerUp ]);

    const autoTriggerLabel = !hasPowerUp
        ? 'Sin power-up activo'
        : isWarmupActive
            ? `Cargando (${ warmupSeconds }s)`
            : `Auto en ${ autoTriggerSeconds }s`;

    const progress = useMemo(() =>
    {
        const teams = hud?.teams ?? [];
        const total = Math.max(0, hud?.totalTiles ?? 0);

        return TEAM_ORDER.map(team =>
        {
            const details = TEAM_META[team];
            const teamState = teams.find(entry => entry.team === team);
            const score = Math.max(0, teamState?.score ?? 0);
            const percent = total > 0 ? Math.min(100, (score / total) * 100) : 0;

            return {
                team,
                score,
                percent,
                label: details?.label || team,
                accent: details?.accent || '#ffffff'
            };
        });
    }, [ hud ]);

    const leadingScore = useMemo(() =>
    {
        if(!progress.length) return 0;
        return Math.max(...progress.map(entry => entry.score));
    }, [ progress ]);

    if(!showHud) return null;

    return (
        <Flex column className="battleball-hud" gap={ 1 }>
            <Flex className="battleball-hud__header" justifyContent="between" alignItems="center">
                <div>
                    <Text bold fontSize={ 4 }>BattleBall Arena</Text>
                    <Text className="battleball-hud__subtitle">Captura casillas y domina el mapa.</Text>
                </div>
                <span className="battleball-hud__timer">{ formatTimer(timeRemaining) }</span>
            </Flex>

            <div className="battleball-powerups" aria-live="polite">
                <div className="battleball-powerups__slot battleball-powerups__slot--timer">
                    { timerAsset ?
                        <img src={ timerAsset } alt={ hasPowerUp && (powerUp?.warmupRemaining ?? 0) > 0 ? 'Contador de power-up disponible' : 'Cuenta atrás del power-up' } className="battleball-powerups__image" />
                        :
                        <span className="battleball-powerups__empty">Sin contador</span> }
                    <Text className="battleball-powerups__caption">{ autoTriggerLabel }</Text>
                </div>

                <button type="button" className="battleball-powerups__slot battleball-powerups__slot--action" disabled={ !canTriggerPowerUp }
                    aria-label={ canTriggerPowerUp ? `Lanzar ${ powerUp?.displayName ?? 'power-up' }` : (isWarmupActive ? 'Power-up cargando' : 'Sin power-up disponible') }
                    onClick={ usePowerUp }>
                    { hasPowerUp ? (
                        <>
                            { powerUpIcon && <img src={ powerUpIcon } alt={ powerUp?.displayName ?? 'Power-up' } className="battleball-powerups__image" /> }
                            <span className="battleball-powerups__label">{ powerUp?.displayName ?? 'Power-up' }</span>
                            <span className="battleball-powerups__cta">{ isWarmupActive ? 'Cargando…' : 'Lanzar' }</span>
                        </>
                    ) : (
                        <span className="battleball-powerups__empty">Sin power-up</span>
                    ) }
                </button>
            </div>

            <Flex column gap={ 1 }>
                { progress.map(entry =>
                    <div key={ entry.team } className={`battleball-hud__bar battleball-hud__bar--${ entry.team } ${ (entry.score > 0 && entry.score === leadingScore) ? 'is-leading' : '' }`}>
                        <Flex justifyContent="between" alignItems="center" className="battleball-hud__bar-head">
                            <span>{ entry.label }</span>
                            <span>{ entry.score } casillas</span>
                        </Flex>
                        <div className="battleball-hud__bar-track">
                            <div className="battleball-hud__bar-fill" style={{ width: `${ entry.percent }%`, background: entry.accent }} />
                        </div>
                    </div>
                ) }
            </Flex>

            { !hasLiveHud &&
                <Flex className="battleball-hud__placeholder" justifyContent="center">
                    <Text>Sin telemetría en vivo, esperando actualización del servidor…</Text>
                </Flex> }

            <Flex className="battleball-hud__footer" justifyContent="between">
                <Text>Ocupadas { capturedTiles } / { totalTiles }</Text>
                <Text>Libres { tilesRemaining }</Text>
            </Flex>
        </Flex>
    );
};
