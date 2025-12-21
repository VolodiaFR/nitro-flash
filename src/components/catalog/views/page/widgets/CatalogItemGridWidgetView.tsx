import { FC, useEffect, useRef } from 'react';
import { IPurchasableOffer, ProductTypeEnum } from '../../../../../api';
import { AutoGrid, AutoGridProps, Flex } from '../../../../../common';
import { useCatalog } from '../../../../../hooks';
import { CatalogGridOfferView } from '../common/CatalogGridOfferView';

interface CatalogItemGridWidgetViewProps extends AutoGridProps {
    isFrame?: boolean;
}

export const CatalogItemGridWidgetView: FC<CatalogItemGridWidgetViewProps> = props => {
    const { columnCount = 5, children = null, isFrame = false, ...rest } = props;



    const { currentOffer = null, setCurrentOffer = null, currentPage = null, setPurchaseOptions = null } = useCatalog();
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (elementRef.current) elementRef.current.scrollTop = 0;
    }, [currentPage]);

    if (!currentPage) return null;

    const selectOffer = (offer: IPurchasableOffer) => {
        offer.activate();

        if (offer.isLazy) return;

        setCurrentOffer(offer);

        if (offer.product && offer.product.productType === ProductTypeEnum.WALL) {
            setPurchaseOptions(prevValue => {
                const newValue = { ...prevValue };
                newValue.extraData = offer.product.extraParam || null;
                return newValue;
            });
        }
    };
    if (isFrame) {
        return (
            
            <Flex gap={2} style={{ width: '360px', flexWrap: 'wrap', alignContent: 'flex-start', overflowY:"auto" }}>
                {currentPage.offers?.length > 0 &&
                    currentPage.offers.map((offer, index) => (
                        <CatalogGridOfferView
                            style={{ flex: '0 0 calc(50% - 4px)', minWidth: 0, height: '55px' }}
                            isFrame
                            key={index}
                            itemActive={currentOffer?.offerId === offer.offerId}
                            offer={offer}
                            selectOffer={selectOffer}
                        />
                    ))
                }
                {children}
            </Flex>
            
        );
    }
    return (
        <AutoGrid innerRef={elementRef} columnCount={columnCount} {...rest}>
            {currentPage.offers?.length > 0 &&
                currentPage.offers.map((offer, index) => (
                    <CatalogGridOfferView
                        key={index}
                        itemActive={currentOffer?.offerId === offer.offerId}
                        offer={offer}
                        selectOffer={selectOffer}
                    />
                ))
            }
            {children}
        </AutoGrid>
    );
};
