import { FC, useEffect, useState } from 'react';
import { LocalizeText, WiredFurniType } from '../../../../api';
import { Column, Flex, Text } from '../../../../common';
import { useWired } from '../../../../hooks';
import { WiredActionBaseView } from './WiredActionBaseView';

export const WiredActionTeleportView: FC<{}> = props => {
    const [teleportWithEffect, setTeleportWithEffect] = useState(true);
    const { trigger = null, setIntParams = null } = useWired();

    const save = () => {
        // Guardamos el valor como 1 (true) o 0 (false)
        setIntParams([teleportWithEffect ? 1 : 0]);
    }

    useEffect(() => {
        // Recuperamos el valor de intData[0] y lo usamos para setear el checkbox
        if (trigger?.intData?.length >= 1) {
            setTeleportWithEffect(trigger.intData[0] === 1);
        }
        else {
            setTeleportWithEffect(true); // valor por defecto
        }
    }, [trigger]);

    return (
        <WiredActionBaseView
            requiresFurni={WiredFurniType.STUFF_SELECTION_OPTION_BY_ID_BY_TYPE_OR_FROM_CONTEXT}
            hasSpecialInput={true}
            save={save}
        >
            <Column gap={1}>
                <Flex alignItems="center" gap={1}>
                    <input className="check-menu-wired" type="checkbox" id="heightFlag" checked={teleportWithEffect} onChange={event => setTeleportWithEffect(event.target.checked)} />
                    <Text style={{textIndent:"10px"}}>{LocalizeText('wiredfurni.params.teleport.use_effect.label')}</Text>
                </Flex>
            </Column>
        </WiredActionBaseView>
    );
}
