import { render } from '@testing-library/react';
import type { FC } from 'react';

import {
  BellIcon,
  ChevronDownIcon,
  DotsIcon,
  LogoIcon,
  MailIcon,
  SearchIcon,
} from '@/components/icons/NavIcons';
import * as DropdownIcons from '@/components/icons/DropdownIcons';

const renderAndExpectSvg = (Icon: FC) => {
  const { container, unmount } = render(<Icon />);

  const svg = container.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveAttribute('aria-hidden', 'true');

  unmount();
};

describe('nav icons', () => {
  it('renders core nav icon svgs', () => {
    [LogoIcon, SearchIcon, BellIcon, MailIcon, DotsIcon].forEach((Icon) => {
      renderAndExpectSvg(Icon);
    });
  });

  it('rotates ChevronDownIcon when open is true', () => {
    const { container } = render(<ChevronDownIcon open />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('rotate-180');
  });
});

describe('dropdown icons', () => {
  it('renders each exported dropdown icon as an svg', () => {
    const icons = Object.values(DropdownIcons) as FC[];

    icons.forEach((Icon) => {
      renderAndExpectSvg(Icon);
    });
  });
});
