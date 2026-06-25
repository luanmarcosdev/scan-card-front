import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  const logo = (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 480 258">
      <defs>
        <linearGradient id="scGrad" x1="22" y1="0" x2="440" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1060f0" />
          <stop offset="100%" stopColor="#00d878" />
        </linearGradient>
      </defs>
      {/* S — top-right arm sweeps left, crosses middle rightward, ends bottom-left */}
      <path
        d="M 218,44 C 176,28 104,30 68,58 C 32,86 50,124 88,140 C 126,156 194,158 222,186 C 210,212 174,227 130,228 C 96,228 62,214 44,194"
        fill="none"
        stroke="url(#scGrad)"
        strokeWidth="40"
        strokeLinecap="round"
      />
      {/* C — top tip close to S mid-right, back almost touching S, ends bottom tip */}
      <path
        d="M 420,50 C 390,26 334,26 302,56 C 270,86 262,132 271,168 C 280,204 306,226 338,230 C 366,232 402,220 420,196"
        fill="none"
        stroke="url(#scGrad)"
        strokeWidth="40"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 80,
          height: 40,
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {logo}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
