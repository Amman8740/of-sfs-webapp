interface SeparatorProps {
  text: string;
}

export default function Separator ({ text }: SeparatorProps) {
  return (
    <div className='relative'>
      <div className='relative flex items-center gap-3 my-5 '>
        <div className='border-t grow border-canvas-line'></div>
        <span className='text-xs uppercase text-canvas-solid'>{text}</span>
        <div className='border-t grow border-canvas-line'></div>
      </div>
    </div>
  );
};
