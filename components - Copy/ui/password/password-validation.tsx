import React, { FC } from 'react';
import { PiCheckDuotone, PiXDuotone } from 'react-icons/pi';

interface PasswordValidationProps {
  isValidLength: boolean;
  containsCharsAndNums: boolean;
  containsSpecialOrLong: boolean;
  passwordsMatch?: boolean;
  passwordTouched: boolean;
}

const PasswordValidation: FC<PasswordValidationProps> = ({
  isValidLength,
  containsCharsAndNums,
  containsSpecialOrLong,
  passwordsMatch,
  passwordTouched,
}) => {
  if (!passwordTouched) return null;

  return (
    <div className='flex flex-col gap-1 text-xs'>
      <p
        className={`flex items-center gap-1.5 ${isValidLength ? 'text-canvas-solid' : 'text-canvas-text'}`}
      >
        {isValidLength ? (
          <PiCheckDuotone className='h-3.5 w-3.5 text-success-solid' />
        ) : (
          <PiXDuotone className='h-3.5 w-3.5 text-canvas-text' />
        )}
        Must contain at least 8 characters
      </p>
      <p
        className={`flex items-center gap-1.5 ${containsCharsAndNums ? 'text-canvas-solid' : 'text-canvas-text'}`}
      >
        {containsCharsAndNums ? (
          <PiCheckDuotone className='h-3.5 w-3.5 text-success-solid' />
        ) : (
          <PiXDuotone className='h-3.5 w-3.5 text-canvas-text' />
        )}
        Must contain uppercase, lowercase letters, and numbers
      </p>
      <p
        className={`flex items-center gap-1.5 ${containsSpecialOrLong ? 'text-canvas-solid' : 'text-canvas-text'}`}
      >
        {containsSpecialOrLong ? (
          <PiCheckDuotone className='h-3.5 w-3.5 text-success-solid' />
        ) : (
          <PiXDuotone className='h-3.5 w-3.5 text-canvas-text' />
        )}
        If less than 12 characters, must contain a special character
      </p>
      {typeof passwordsMatch === 'boolean' && (
        <p
          className={`flex items-center gap-1 text-canvas-text ${passwordsMatch ? 'text-canvas-solid' : 'text-canvas-text'}`}
        >
          {passwordsMatch ? (
            <PiCheckDuotone className='h-3.5 w-3.5 text-success-solid' />
          ) : (
            <PiXDuotone className='h-3.5 w-3.5 text-canvas-text' />
          )}
          Passwords must be the same
        </p>
      )}
    </div>
  );
};

export default PasswordValidation;
