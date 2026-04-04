import { Heart, Repeat2, Share, Link2, ListMusic } from 'lucide-react';
import Button from '../buttons/Button';

export const ActionToolbar = () => {
  // Define a consistent small size for all icons
  const iconSize = 16; 

  return (
    <div className="flex items-center justify-between py-3 bg-background mt-3">
      <div className="flex items-center gap-1.5">
        {/* We use h-8 and px-2 to make the button much smaller than the default */}
        <Button variant='secondary' className="h-7 px-2 flex items-center justify-center gap-1.5 text-xs">
          <Heart size={iconSize} />
        </Button>

        <Button variant='secondary' className="h-7 px-2 flex items-center justify-center gap-1.5 text-xs">
          <Repeat2 size={iconSize} />
        </Button>

        <Button variant='secondary' className="h-7 px-2 flex items-center justify-center gap-1.5 text-xs">
          <Share size={iconSize} />
        </Button>

        <Button variant='secondary' className="h-7 px-2 flex items-center justify-center gap-1.5 text-xs">
          <Link2 size={iconSize} />
        </Button>

        <Button variant='secondary' className="h-7 px-2 flex items-center justify-center gap-1.5 text-xs">
          <ListMusic size={iconSize} />
        </Button>
      </div>
    </div>
  );
};