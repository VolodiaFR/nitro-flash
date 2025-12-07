import { FC, useMemo } from 'react';
import { Flex, FlexProps } from '../..';

interface NitroCardTabsProps extends FlexProps
{
    subClassName?: string;
    isWiredMonitor?: boolean;
}
export const NitroCardTabsView: FC<NitroCardTabsProps> = props =>
{
    const { justifyContent = 'center', gap = 1, classNames = [], children = null,subClassName = '', isWiredMonitor = false, ...rest } = props;

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = [ 'container-fluid', 'nitro-card-tabs', 'pt-1', 'position-relative' ];

        if(classNames.length) newClassNames.push(...classNames);

        return newClassNames;
    }, [ classNames ]);

    if (isWiredMonitor) {
        return <div>Wired Monitor</div>;
    }

    return (
        <Flex classNames={ getClassNames } { ...rest }>
            <ul className={ 'nav nav-tabs border-0 ' + subClassName }>
                { children }
            </ul>
        </Flex>
    );
}
