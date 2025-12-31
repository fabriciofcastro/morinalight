'use client';

import * as React from 'react';
import { cn } from '@morina/ui';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> { }

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
                    className
                )}
                {...props}
            />
        );
    }
);
Avatar.displayName = 'Avatar';

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> { }

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
    ({ className, ...props }, ref) => {
        return (
            <img
                ref={ref}
                className={cn('aspect-square h-full w-full object-cover', className)}
                {...props}
            />
        );
    }
);
AvatarImage.displayName = 'AvatarImage';

export interface AvatarFallback extends React.HTMLAttributes<HTMLDivElement> { }

export const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallback>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800',
                    className
                )}
                {...props}
            />
        );
    }
);
AvatarFallback.displayName = 'AvatarFallback';
