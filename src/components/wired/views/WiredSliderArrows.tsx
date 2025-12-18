import { FC, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ReactSlider from 'react-slider';
import {  Flex } from '../../../common';

export interface WiredSliderArrowsProps
{
	value: number;
	min?: number;
	max?: number;
	step?: number;
	onChange: (value: number) => void;
}

export const WiredSliderArrows: FC<WiredSliderArrowsProps> = ({ value, min = 0, max = 20, step = 1, onChange }) =>
{
	const clamp = useCallback((nextValue: number) =>
	{
		if(nextValue < min) return min;
		if(nextValue > max) return max;

		return nextValue;
	}, [ min, max ]);

	const stepFn = useCallback((delta: number) =>
	{
		onChange(clamp(value + (delta * step)));
	}, [ clamp, onChange, value, step ]);

	return (
		<Flex center gap={ 2 }>
			<div  className="wired-slider-arrow" onClick={ () => stepFn(-1) } aria-label="Decrease value">
			</div>
			<ReactSlider
				className={ 'wired-slider' }
				min={ min }
				max={ max }
				value={ value }
				onChange={ event => onChange(event) } />
			<div  className="wired-slider-arrow-left" onClick={ () => stepFn(1) } aria-label="Increase value">

			</div>
		</Flex>
	);
}
