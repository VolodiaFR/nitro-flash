import { NitroConfiguration } from '@nitrots/nitro-renderer';
import { useEffect, useMemo, useState } from 'react';

const FRAME_ASSET_FILES = {
    profile: 'profile.gif',
    infowidget: 'infowidget.gif',
    border: 'border.png',
    username: 'username.png'
} as const;

export type FrameAssetType = keyof typeof FRAME_ASSET_FILES;

const DEFAULT_FRAME_CODE = 'default';

export const useFrameAsset = (frameCode?: string, assetType: FrameAssetType = 'profile') =>
{
    const personalizationUrl = NitroConfiguration.getValue<string>('personalization.url');
    const assetFile = useMemo(() => FRAME_ASSET_FILES[assetType] || null, [ assetType ]);
    const [ assetUrl, setAssetUrl ] = useState<string>(null);

    useEffect(() =>
    {
        if(!personalizationUrl || !assetFile)
        {
            setAssetUrl(null);
            return;
        }

        const buildUrl = (code: string) => `${ personalizationUrl }/${ code }/${ assetFile }`;
        const desiredCode = frameCode || DEFAULT_FRAME_CODE;
        const desiredUrl = buildUrl(desiredCode);

        if(typeof Image === 'undefined')
        {
            setAssetUrl(desiredUrl);
            return;
        }

        let disposed = false;
        let fallbackLoader: HTMLImageElement = null;

        const applyUrl = (url: string) =>
        {
            if(disposed) return;

            setAssetUrl(url);
        };

        const loadFallback = () =>
        {
            if(desiredCode === DEFAULT_FRAME_CODE)
            {
                applyUrl(null);
                return;
            }

            const fallbackUrl = buildUrl(DEFAULT_FRAME_CODE);

            fallbackLoader = new Image();

            fallbackLoader.onload = () => applyUrl(fallbackUrl);
            fallbackLoader.onerror = () => applyUrl(null);
            fallbackLoader.src = fallbackUrl;
        };

        const loader = new Image();

        loader.onload = () => applyUrl(desiredUrl);
        loader.onerror = loadFallback;
        loader.src = desiredUrl;

        return () =>
        {
            disposed = true;
            loader.onload = null;
            loader.onerror = null;

            if(fallbackLoader)
            {
                fallbackLoader.onload = null;
                fallbackLoader.onerror = null;
            }
        };
    }, [ personalizationUrl, assetFile, frameCode ]);

    return assetUrl;
};
