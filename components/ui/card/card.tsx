import React, { ReactNode } from 'react';
interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Card ({ title, description, footer, children }: Props) {
  return (
    <>
      <div className='flex flex-col w-full gap-5 px-4 py-3 lg:p-0'>
        <div className='flex flex-col w-full gap-1 text-center'>
          <h3 className='text-3xl font-semibold text-canvas-text-contrast'>
            {title}
          </h3>
          <p className='text-canvas-text'>{description}</p>
        </div>
        {children}
      </div>
      {footer && (
        <div className='p-4 border-t rounded-b-md border-zinc-700 bg-zinc-900 text-zinc-500'>
          {footer}
        </div>
      )}
    </>
  );
};
