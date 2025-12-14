import { BLEND_MODES } from '@pixi/constants';
import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { GlowFilter } from 'pixi-filters';
import { IRoomObject, IRoomObjectSpriteVisualization, IRoomObjectSprite, RoomObjectCategory } from '@nitrots/nitro-renderer';
import { GetRoomEngine } from '..';

export class VariableHighlightVisualizer
{
    private static _highlightFilter: ColorMatrixFilter = null;
    private static _highlightGlowFilter: GlowFilter = null;
    private static _highlightSpriteState: WeakMap<IRoomObjectSprite, { alpha: number; color: number; blendMode: number }> = new WeakMap();

    private static ensureHighlightFilter(): ColorMatrixFilter
    {
        if(!VariableHighlightVisualizer._highlightFilter)
        {
            const filter = new ColorMatrixFilter();
            const highlightMatrix = [
                0.15, 0.25, 0.40, 0, 0,
                0.15, 0.25, 0.40, 0, 0,
                0.45, 0.60, 1.00, 0, 0.05,
                0,    0,    0,    1, 0
            ] as unknown as any;

            filter.matrix = highlightMatrix;

            VariableHighlightVisualizer._highlightFilter = filter;
        }

        return VariableHighlightVisualizer._highlightFilter;
    }

    private static ensureHighlightGlowFilter(): GlowFilter
    {
        if(!VariableHighlightVisualizer._highlightGlowFilter)
        {
            VariableHighlightVisualizer._highlightGlowFilter = new GlowFilter({
                color: 0xC8F2FF,
                distance: 6,
                outerStrength: 2.1,
                innerStrength: 0,
                quality: 3
            });
        }

        return VariableHighlightVisualizer._highlightGlowFilter;
    }

    public static show(furniId: number): void
    {
        const roomObject = VariableHighlightVisualizer.getRoomObject(furniId);
        VariableHighlightVisualizer.applyHighlight(roomObject);
    }

    public static hide(furniId: number): void
    {
        const roomObject = VariableHighlightVisualizer.getRoomObject(furniId);
        VariableHighlightVisualizer.clearHighlight(roomObject);
    }

    public static applySelectionShaderToFurni(furniIds: number[]): void
    {
        for(const furniId of furniIds)
        {
            VariableHighlightVisualizer.applyHighlight(VariableHighlightVisualizer.getRoomObject(furniId));
        }
    }

    public static clearSelectionShaderFromFurni(furniIds: number[]): void
    {
        for(const furniId of furniIds)
        {
            VariableHighlightVisualizer.clearHighlight(VariableHighlightVisualizer.getRoomObject(furniId));
        }
    }

    private static getRoomObject(objectId: number): IRoomObject
    {
        const roomEngine = GetRoomEngine();

        return roomEngine.getRoomObject(roomEngine.activeRoomId, objectId, RoomObjectCategory.FLOOR);
    }

    private static applyHighlight(roomObject: IRoomObject): void
    {
        if(!roomObject) return;

        const visualization = (roomObject.visualization as IRoomObjectSpriteVisualization);

        if(!visualization) return;

        const highlightFilter = VariableHighlightVisualizer.ensureHighlightFilter();
        const glowFilter = VariableHighlightVisualizer.ensureHighlightGlowFilter();

        for(const sprite of visualization.sprites)
        {
            if(!sprite) continue;

            let state = VariableHighlightVisualizer._highlightSpriteState.get(sprite);

            if(!state)
            {
                state = {
                    alpha: (sprite.alpha === undefined || sprite.alpha === null) ? 255 : sprite.alpha,
                    color: (sprite.color === undefined || sprite.color === null) ? 0xFFFFFF : sprite.color,
                    blendMode: (sprite.blendMode === undefined || sprite.blendMode === null) ? BLEND_MODES.NORMAL : sprite.blendMode
                };

                VariableHighlightVisualizer._highlightSpriteState.set(sprite, state);
            }

            const preservedFilters = sprite.filters ? sprite.filters.filter(filter => ((filter !== highlightFilter) && (filter !== glowFilter))) : [];

            preservedFilters.push(highlightFilter, glowFilter);

            sprite.filters = preservedFilters;
            sprite.color = 0xBEEBFF;
            sprite.blendMode = BLEND_MODES.SCREEN;
            sprite.alpha = Math.min(state.alpha, 175);
        }
    }

    private static clearHighlight(roomObject: IRoomObject): void
    {
        if(!roomObject) return;

        const visualization = (roomObject.visualization as IRoomObjectSpriteVisualization);

        if(!visualization) return;

        const highlightFilter = VariableHighlightVisualizer._highlightFilter;
        const glowFilter = VariableHighlightVisualizer._highlightGlowFilter;

        for(const sprite of visualization.sprites)
        {
            if(!sprite) continue;

            const state = VariableHighlightVisualizer._highlightSpriteState.get(sprite);

            if(state)
            {
                sprite.alpha = state.alpha;
                sprite.color = state.color;
                sprite.blendMode = state.blendMode;

                VariableHighlightVisualizer._highlightSpriteState.delete(sprite);
            }

            if(sprite.filters && sprite.filters.length)
            {
                const nextFilters = sprite.filters.filter(filter => ((filter !== highlightFilter) && (filter !== glowFilter)));

                if(nextFilters.length !== sprite.filters.length) sprite.filters = nextFilters.length ? nextFilters : [];
            }
        }
    }
}
