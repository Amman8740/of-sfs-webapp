import React from 'react';
import { Input, IconButton, Label } from '@/components/ui';
import { PiEyeSlashDuotone, PiEyeLight } from 'react-icons/pi';

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  isVisible: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleVisibility: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  isVisible,
  onToggleVisibility,
}) => (
  <div className='relative flex flex-col gap-1.5 pt-3 lg:p-0'>
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      placeholder={placeholder}
      type={isVisible ? 'text' : 'password'}
      name={id}
      autoComplete='current-password'
      value={value}
      onChange={onChange}
    />
    <div className='absolute bottom-2 right-3.5 text-canvas-text'>
      <IconButton
        variant='gray'
        type='ghost'
        size='small'
        className='text-canvas-text'
        tooltipCustomStyle={{ bottom: '27px', right: '-36px' }}
        tooltipContent={isVisible ? 'Hide password' : 'Show password'}
        tooltipDirection='top'
        icon={
          isVisible ? (
            <PiEyeLight className='text-canvas-text' />
          ) : (
            <PiEyeSlashDuotone className='text-canvas-text' />
          )
        }
        onClick={onToggleVisibility}
      />
    </div>
  </div>
);

export default PasswordInput;