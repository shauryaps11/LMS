import React from 'react'

// Generic animated skeleton block
export const SkeletonBlock = ({ className = '' }) => (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
)

// Course card skeleton
export const CourseCardSkeleton = () => (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <SkeletonBlock className="w-full h-40" />
        <div className="p-4 space-y-2">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/2" />
            <SkeletonBlock className="h-3 w-1/3" />
        </div>
    </div>
)

// Table row skeleton
export const TableRowSkeleton = ({ cols = 4 }) => (
    <tr className="border-b border-gray-100">
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <SkeletonBlock className="h-4 w-full" />
            </td>
        ))}
    </tr>
)

// Stat card skeleton
export const StatCardSkeleton = () => (
    <div className="flex items-center gap-3 border border-gray-200 p-4 w-56 rounded-md">
        <SkeletonBlock className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
            <SkeletonBlock className="h-6 w-16" />
            <SkeletonBlock className="h-3 w-24" />
        </div>
    </div>
)
