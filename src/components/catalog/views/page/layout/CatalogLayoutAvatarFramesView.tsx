import { FC, useEffect, useState } from 'react';
import { Base, Button, Column, Flex, Grid, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../../../../common';
import { useCatalog, useFrameAsset } from '../../../../../hooks';
import { CatalogFirstProductSelectorWidgetView } from '../widgets/CatalogFirstProductSelectorWidgetView';
import { CatalogItemGridWidgetView } from '../widgets/CatalogItemGridWidgetView';
import { CatalogPurchaseWidgetView } from '../widgets/CatalogPurchaseWidgetView';
import { CatalogTotalPriceWidget } from '../widgets/CatalogTotalPriceWidget';
import { CatalogLayoutProps } from './CatalogLayout.types';

export const CatalogLayoutAvatarFramesView: FC<CatalogLayoutProps> = props => {
    const { page = null } = props;
    const { currentOffer = null } = useCatalog();
    const frameCode = currentOffer?.badgeCode || currentOffer?.product?.extraParam || null;
    const framePreview = useFrameAsset(frameCode, 'preview');
    const [ isPreviewOpen, setIsPreviewOpen ] = useState(false);

    useEffect(() => {
        setIsPreviewOpen(false);
    }, [ currentOffer ]);

    return (
        <>
            <CatalogFirstProductSelectorWidgetView />
            
            <Grid columnCount={2} gap={2}>
                <CatalogItemGridWidgetView isFrame shrink />
                <Column style={{width:"360px"}} size={5} gap={1} overflow="hidden">
                    {currentOffer &&
                        <>
                            <Base className="catalog-frame-preview">
                                <Text center bold truncate>{currentOffer.localizationName}</Text>
                            </Base>
                            <Flex justifyContent="end">
                                <CatalogTotalPriceWidget alignItems="end" />
                            </Flex>
                            <Button fullWidth onClick={ () => setIsPreviewOpen(true) }>Preview</Button>
                            <CatalogPurchaseWidgetView noGiftOption />
                        </>}
                    {!currentOffer &&
                        <Column center gap={1}>
                            {!!page?.localization?.getImage(1) && <img alt="" src={page.localization.getImage(1)} />}
                            {!!page?.localization?.getText(0) && <Text center dangerouslySetInnerHTML={{ __html: page.localization.getText(0) }} />}
                        </Column>}
                </Column>
            </Grid>

            {isPreviewOpen &&
                <NitroCardView uniqueKey="catalog-frame-preview" className="catalog-frame-preview-card" theme="primary">
                    <NitroCardHeaderView headerText={ currentOffer?.localizationName || 'Preview' } onCloseClick={ () => setIsPreviewOpen(false) } />
                    <NitroCardContentView>
                        <Flex column alignItems="center" justifyContent="center" fullWidth fullHeight style={{ minHeight: 220 }}>
                            {framePreview ?
                                <img alt="Frame preview" src={ framePreview } style={{ maxWidth: '100%', height: 'auto', imageRendering: 'pixelated' }} />
                                :
                                <Text bold center>Preview no disponible</Text>
                            }
                        </Flex>
                    </NitroCardContentView>
                </NitroCardView>}
        </>
    );
}
