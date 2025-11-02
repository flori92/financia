import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ''}`}
      {...props}
    />
  )
);
Avatar.displayName = 'Avatar';

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => (
    <img
      ref={ref}
      className={`aspect-square h-full w-full ${className || ''}`}
      {...props}
    />
  )
);
AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-900 ${className || ''}`}
      {...props}
    />
  )
);
AvatarFallback.displayName = 'AvatarFallback';
